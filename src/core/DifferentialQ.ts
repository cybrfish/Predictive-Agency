import type { GlobalState, Action } from './types';
import { Agent } from './Agent';

export class DifferentialQLearning {
  alpha: number;
  beta: number;
  rBar: number = 0;
  
  constructor(alpha: number = 0.1, beta: number = 0.01) {
    this.alpha = alpha;
    this.beta = beta;
  }
  
  update(
    agent: Agent,
    state: GlobalState,
    action: Action,
    reward: number,
    nextState: GlobalState
  ): void {
    // Get current Q-value
    const currentQ = agent.getQ(state, action);
    
    // Compute TD error
    // δ = R - r̄ + max_a' Q(s',a') - Q(s,a)
    const delta = reward - this.rBar + this.getMaxQ(agent, nextState) - currentQ;
    
    // Update Q: Q ← Q + α δ
    agent.setQ(state, action, currentQ + this.alpha * delta);
    
    // Update baseline: r̄ ← r̄ + β δ
    this.rBar += this.beta * delta;
    
    // Clamp r̄ to prevent explosion
    this.rBar = Math.max(-1000, Math.min(1000, this.rBar));
  }
  
  private getMaxQ(agent: Agent, state: GlobalState): number {
    // Get max Q for all possible actions
    const actions = this.getPossibleActions();
    let maxQ = -Infinity;
    
    for (const action of actions) {
      const qValue = agent.getQ(state, action);
      maxQ = Math.max(maxQ, qValue);
    }
    
    return maxQ > -Infinity ? maxQ : 0;
  }
  
  getPossibleActions(): Action[] {
    // Discrete action space for Phase 0
    const takeRates = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3];
    const serviceLevels = [0.3, 0.5, 0.7, 0.9];
    const openness = [0.2, 0.5, 0.8];
    
    const actions: Action[] = [];
    
    // Sample key combinations
    for (const tr of takeRates) {
      for (const sl of serviceLevels) {
        for (const op of openness) {
          actions.push({ takeRate: tr, serviceLevel: sl, openness: op });
        }
      }
    }
    
    return actions.slice(0, 20); // Limit to 20 to keep reasonable
  }
  
  reset(): void {
    this.rBar = 0;
  }
}
