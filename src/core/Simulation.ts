import { Agent } from './Agent';
import type { GlobalState, HistoryEntry, Action } from './types';
import { DEFAULT_CONFIG } from './types';
import { DifferentialQLearning } from './DifferentialQ';
import type { ScenarioConfig } from './types';
import { BoundaryManager } from './BoundaryManager';
import { PowerCalculator } from './PowerCalculator';

export class Simulation {
  agents: Agent[] = [];
  globalState: GlobalState;
  qLearning: DifferentialQLearning;
  boundary: BoundaryManager;
  powerCalc: PowerCalculator;
  t = 0;
  history: HistoryEntry[] = [];
  config = DEFAULT_CONFIG;
  // Parallel average rewards per boundary for plotting
  rBarB0 = 0;
  rBarB1 = 0;
  rBarB2 = 0;
  
  constructor(scenario: ScenarioConfig) {
    // Initialize agents from scenario
    let idCounter = 0;
    for (const group of scenario.agentConfig) {
      for (let i = 0; i < group.count; i++) {
        this.agents.push(new Agent(idCounter++, group.type, group.takeRate, group.serviceLevel));
      }
    }
    
    // Initialize state
    this.globalState = {
      demand: 60,
      capacity: 50,
      safety: 70,
      surplus: 55,
      trust: 60,
      congestion: 25,
    };
    
    this.qLearning = new DifferentialQLearning(this.config.alphaQ, this.config.betaR);
    this.boundary = new BoundaryManager();
    this.powerCalc = new PowerCalculator();
  }
  
  step(): void {
    // Snapshot pre-dynamics state for proper TD update
    const prevState: GlobalState = { ...this.globalState };

    // 1. Observe and select actions
    const possibleActions = this.qLearning.getPossibleActions();
    for (const agent of this.agents) {
      agent.observe(prevState);
      agent.action = agent.selectAction(possibleActions);
    }

    const actions: Action[] = this.agents.map(a => a.action);

    // 2. Compute rewards per boundary to visualize evolution without step-changes
    const rewardB0 = this.computeRewardForBoundary('B0', prevState, actions);
    const rewardB1 = this.computeRewardForBoundary('B1', prevState, actions);
    const rewardB2 = this.computeRewardForBoundary('B2', prevState, actions);
    // Update running averages for each boundary
    const beta = this.config.betaR;
    this.rBarB0 += beta * (rewardB0 - this.rBarB0);
    this.rBarB1 += beta * (rewardB1 - this.rBarB1);
    this.rBarB2 += beta * (rewardB2 - this.rBarB2);
    // Ecosystem view = current boundary; Network view = B0 (no externalities)
    const rewardEcosystem = this.computeReward(prevState, actions);
    const rewardNetwork = rewardB0;
    const alpha = this.boundary.computeAlignmentCoefficient(rewardEcosystem, rewardNetwork);

    // 3. Agency via one-step leave-one-out (counterfactual immediate marginal)
    for (let i = 0; i < this.agents.length; i++) {
      const zeroAction: Action = { takeRate: 0, serviceLevel: 0, openness: 0 };
      const looActions = actions.slice();
      looActions[i] = zeroAction;
      const rewardWithout = this.computeReward(prevState, looActions);
      this.agents[i].agency = rewardEcosystem - rewardWithout;
    }
    
    // 4. Update global state based on actions (dynamics + boundary couplings)
    this.updateGlobalState(actions);
    
    // 5. Update Q and Energy for each agent using (prevState → nextState)
    for (const agent of this.agents) {
      this.qLearning.update(agent, prevState, agent.action, rewardEcosystem, this.globalState);
      agent.updateEnergy(this.globalState.surplus);
    }
    
    // 5. Compute metrics every 10 steps
    if (this.t % 10 === 0) {
      for (const agent of this.agents) {
        agent.contribution = agent.computeContribution(this.globalState);
      }
      for (const agent of this.agents) {
        agent.power = this.powerCalc.computePower(
          agent, this.agents, this.qLearning.rBar
        );
      }
    }
    
    // 6. Record history
    const totalEnergy = this.agents.reduce((sum, a) => sum + a.localState.energy, 0);
    const avgAgency = this.agents.reduce((sum, a) => sum + a.agency, 0) / this.agents.length;

    this.history.push({
      t: this.t,
      rBar: this.qLearning.rBar,
      reward: rewardEcosystem,
      alpha: alpha,
      state: { ...this.globalState },
      totalEnergy,
      avgAgency,
      rBarB0: this.rBarB0,
      rBarB1: this.rBarB1,
      rBarB2: this.rBarB2,
      rInstB0: rewardB0,
      rInstB1: rewardB1,
      rInstB2: rewardB2,
    });
    
    this.t++;
  }
  
  private updateGlobalState(actions: Action[]): void {
    const avgTakeRate = actions.reduce((s, a) => s + a.takeRate, 0) / actions.length;
    const avgService = actions.reduce((s, a) => s + a.serviceLevel, 0) / actions.length;

    // Refactored simulation dynamics based on a clearer resource flow model.
    const s = this.globalState;

    // A simple resource model: service generates, take-rate extracts, and there's a base cost.
    const resourceGeneration = avgService * 4.0;
    const resourceExtraction = avgTakeRate * 10.0;
    const baseUpkeep = 1.0; 
    const netResourceFlow = resourceGeneration - resourceExtraction - baseUpkeep;

    // The system's surplus is the direct accumulation of net resources.
    s.surplus = clamp(s.surplus + netResourceFlow, 0, 100);

    // Other state variables improve or degrade based on whether the system is in surplus or deficit.
    if (netResourceFlow > 0) {
      // Regenerative state: invest the surplus into system health.
      s.trust = clamp(s.trust + netResourceFlow * 0.2, 0, 100);
      s.safety = clamp(s.safety + netResourceFlow * 0.2, 0, 100);
      s.capacity = clamp(s.capacity + netResourceFlow * 0.1, 0, 100);
      s.congestion = clamp(s.congestion - netResourceFlow * 0.5, 0, 100);
    } else {
      // Extractive state: the deficit erodes system health.
      s.trust = clamp(s.trust + netResourceFlow * 0.5, 0, 100); // larger negative multiplier
      s.safety = clamp(s.safety + netResourceFlow * 0.5, 0, 100);
      s.capacity = clamp(s.capacity + netResourceFlow * 0.2, 0, 100);
      s.congestion = clamp(s.congestion - netResourceFlow * 1.0, 0, 100); // congestion grows
    }
    
    // Boundary couplings (externalities appear beyond B0)
    const couplings = this.boundary.getDynamicsCouplings();
    s.capacity = clamp(s.capacity - s.congestion * couplings.congestionToCapacity, 0, 100);
    s.trust = clamp(s.trust + (s.safety - 50) * couplings.safetyToTrust, 0, 100);

    // Demand remains reactive to surplus.
    s.demand = clamp(s.demand + (60 - s.surplus) * 0.015, 20, 80);
  }
  
  private computeReward(state: GlobalState, actions: Action[], options?: { frictionWeightOverride?: number }): number {
    const w = this.config;
    const bw = this.boundary.getRewardWeights();
    const frictionWeight = options?.frictionWeightOverride ?? bw.friction;
    const safetyWeight = bw.safety;

    // Ecosystem value (positive contributions)
    const value = (
      w.wSurplus * state.surplus +
      w.wSafety * state.safety +
      w.wTrust * state.trust +
      w.wCapacity * state.capacity +
      w.wDemand * state.demand
    );

    // Extraction/leakage (negative)
    const avgTakeRate = actions.reduce((sum, a) => sum + a.takeRate, 0) / actions.length;
    const extraction = avgTakeRate * w.extractionPenalty;

    // Friction penalties (boundary-weighted)
    const frictionRaw = (0.4 * state.congestion) + (0.6 * (100 - state.safety) * safetyWeight);
    const friction = frictionRaw * w.frictionPenalty * frictionWeight;

    return value - extraction - friction;
  }

  // Compute reward as-if a given boundary level were active (for parallel plotting)
  private computeRewardForBoundary(level: 'B0' | 'B1' | 'B2', state: GlobalState, actions: Action[]): number {
    const w = this.config;
    const bw = this.boundary.getRewardWeightsFor(level);

    const value = (
      w.wSurplus * state.surplus +
      w.wSafety * state.safety +
      w.wTrust * state.trust +
      w.wCapacity * state.capacity +
      w.wDemand * state.demand
    );

    const avgTakeRate = actions.reduce((sum, a) => sum + a.takeRate, 0) / actions.length;
    const extraction = avgTakeRate * w.extractionPenalty;

    const frictionRaw = (0.4 * state.congestion) + (0.6 * (100 - state.safety) * bw.safety);
    const friction = frictionRaw * w.frictionPenalty * bw.friction;

    return value - extraction - friction;
  }

  // Note: network vs ecosystem rewards are computed per-step using computeReward(...) with
  // frictionWeightOverride to ignore externalities for the network view.
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}


