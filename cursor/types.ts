// Core type definitions for Predictive Agency simulation

export interface GlobalState {
  demand: number;      // Resource availability [0-100]
  capacity: number;    // System throughput [0-100]
  safety: number;      // Risk/resilience [0-100]
  surplus: number;     // Distributed wealth [0-100]
  trust: number;       // Social capital [0-100]
  congestion: number;  // Friction/waste [0-100]
}

export interface Action {
  takeRate: number;      // τ ∈ [0, 0.5]
  serviceLevel: number;  // effort ∈ [0, 1]
  openness: number;      // collaboration ∈ [0, 1]
}

export interface Belief {
  mu: GlobalState;       // Mean estimate
  sigma: number;         // Uncertainty (scalar for now)
}

export interface LocalState {
  energy: number;        // Internal reserves
  stress: number;        // Friction experienced
}

export type AgentType = 'platform' | 'driver' | 'regulator' | 'investor';

export type BoundaryLevel = 'B0' | 'B1' | 'B2';

export interface HistoryEntry {
  t: number;
  rBar: number;
  reward: number;
  alpha: number;
  state: GlobalState;
}

export interface Message {
  from: number;
  to: number;
  belief: Belief;
}

export interface ScenarioConfig {
  name: string;
  agentConfig: Array<{
    type: AgentType;
    count: number;
    takeRate: number;
    serviceLevel: number;
  }>;
}

export interface Config {
  // Learning
  alphaQ: number;        // Q-learning rate
  betaR: number;         // Baseline update rate
  epsilon: number;       // Exploration rate
  
  // Simulation
  numAgents: number;
  stepsPerRun: number;
  
  // Power calculation
  shapleyPerms: number;
  powerUpdateFreq: number;
  
  // Reward weights
  wSurplus: number;
  wSafety: number;
  wTrust: number;
  wCapacity: number;
  wDemand: number;
  
  // Penalties
  extractionPenalty: number;
  frictionPenalty: number;
}

export const DEFAULT_CONFIG: Config = {
  alphaQ: 0.1,
  betaR: 0.01,
  epsilon: 0.1,
  numAgents: 200,
  stepsPerRun: 1000,
  shapleyPerms: 16,
  powerUpdateFreq: 10,
  wSurplus: 0.3,
  wSafety: 0.25,
  wTrust: 0.2,
  wCapacity: 0.15,
  wDemand: 0.1,
  extractionPenalty: 10,
  frictionPenalty: 0.1,
};
