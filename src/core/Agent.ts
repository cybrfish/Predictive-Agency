import type { Action, Belief, GlobalState, LocalState, Message, AgentType } from './types';
import { DEFAULT_CONFIG } from './types';

export class Agent {
  id: number;
  type: AgentType;
  belief: Belief;
  action: Action;
  localState: LocalState;
  Q: Map<string, number> = new Map();
  power: number = 0;
  agency: number = 0;
  contribution: number = 0;
  
  // Initial parameters from scenario config
  initialTakeRate: number;
  initialServiceLevel: number;
  
  constructor(id: number, type: AgentType, takeRate: number, serviceLevel: number) {
    this.id = id;
    this.type = type;
    this.initialTakeRate = takeRate;
    this.initialServiceLevel = serviceLevel;
    
    // Initialize belief with default state
    this.belief = {
      mu: {
        demand: 50,
        capacity: 50,
        safety: 50,
        surplus: 50,
        trust: 50,
        congestion: 20,
      },
      sigma: 0.1,
    };
    
    // Initialize action
    this.action = {
      takeRate: takeRate,
      serviceLevel: serviceLevel,
      openness: 0.5,
    };
    
    // Initialize local state
    this.localState = {
      energy: 100,
      stress: 0,
    };
  }
  
  observe(globalState: GlobalState): void {
    // Update belief based on observation
    // For Phase 0: direct observation (no noise)
    this.belief.mu = { ...globalState };
    this.belief.sigma = 0.1;
  }
  
  selectAction(possibleActions: Action[]): Action {
    const epsilon = DEFAULT_CONFIG.epsilon;
    
    if (Math.random() < epsilon) {
      // Exploration: choose a random action from the possible set
      return possibleActions[Math.floor(Math.random() * possibleActions.length)];
    } else {
      // Exploitation: choose the best-known action
      let bestAction = this.action;
      let maxQ = -Infinity;
      
      for (const action of possibleActions) {
        const qValue = this.getQ(this.belief.mu, action);
        if (qValue > maxQ) {
          maxQ = qValue;
          bestAction = action;
        }
      }
      return bestAction;
    }
  }
  
  updateBelief(messages: Message[]): void {
    // Simplified belief update
    // Phase 0: no GBP yet, just maintain current belief
    // (Will be expanded in Phase 2)
  }
  
  updateQ(reward: number, rBar: number, alpha: number): void {
    // This will be called by DifferentialQ
    // Placeholder for now
  }
  
  computeContribution(globalState: GlobalState): number {
    // k_i = circulation - extraction
    // circulation = positive flow to system
    const circulation = this.action.serviceLevel * this.action.openness * 10;
    // extraction = resources taken out
    const extraction = this.action.takeRate * globalState.surplus;
    
    this.contribution = circulation - extraction;
    return this.contribution;
  }
  
  // Helper method to create state-action key
  stateActionKey(state: GlobalState, action: Action): string {
    return `${JSON.stringify(state)}_${action.takeRate}_${action.serviceLevel}_${action.openness}`;
  }
  
  // Helper method to get Q-value for state-action pair
  getQ(state: GlobalState, action: Action): number {
    const key = this.stateActionKey(state, action);
    return this.Q.get(key) || 0;
  }
  
  // Helper method to set Q-value
  setQ(state: GlobalState, action: Action, value: number): void {
    const key = this.stateActionKey(state, action);
    this.Q.set(key, value);
  }
}
