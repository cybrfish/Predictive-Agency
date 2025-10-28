import { Agent } from './Agent';
import type { GlobalState, HistoryEntry } from './types';
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
    // 1. Observe and select actions
    const possibleActions = this.qLearning.getPossibleActions();
    for (const agent of this.agents) {
      agent.observe(this.globalState);
      agent.action = agent.selectAction(possibleActions);
    }
    
    // 2. Update global state based on average actions
    this.updateGlobalState();
    
    // 3. Compute reward
    const reward = this.computeReward();
    
    // 4. Update Q for each agent
    for (const agent of this.agents) {
      this.qLearning.update(agent, this.globalState, agent.action, reward, this.globalState);
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
    this.history.push({
      t: this.t,
      rBar: this.qLearning.rBar,
      reward: reward,
      alpha: this.boundary.computeAlignmentCoefficient(
        this.computeEcosystemReward(),
        this.computeNetworkReward()
      ),
      state: { ...this.globalState },
    });
    
    this.t++;
  }
  
  private updateGlobalState(): void {
    const avgTakeRate = this.agents.reduce((s, a) => s + a.action.takeRate, 0) / this.agents.length;
    const avgService = this.agents.reduce((s, a) => s + a.action.serviceLevel, 0) / this.agents.length;

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
    
    // Demand remains reactive to surplus.
    s.demand = clamp(s.demand + (60 - s.surplus) * 0.015, 20, 80);
  }
  
  private computeReward(): number {
    const s = this.globalState;
    
    // A simpler, more direct reward function based on the sum of healthy state variables minus penalties.
    const value = s.surplus + s.trust + s.safety + s.capacity;
    const penalty = s.congestion * 1.5; // Make congestion highly undesirable.

    // Normalize the reward to a reasonable range.
    return (value - penalty) / 5.0;
  }

  computeEcosystemReward(): number {
    if (this.history.length < 50) return this.qLearning.rBar;
    // r* at current boundary - average of last 50 rewards
    return this.history.slice(-50).reduce((sum, h) => sum + h.reward, 0) / 50;
  }
  
  computeNetworkReward(): number {
    // Narrow view of network health (surplus + trust, ignoring externalities)
    // Added a small epsilon (0.01) to prevent division by zero.
    return (this.globalState.surplus * 0.7 + this.globalState.trust * 0.3) / 2 + 0.01;
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}


