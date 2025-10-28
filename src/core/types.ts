export interface GlobalState {
  demand: number;
  capacity: number;
  safety: number;
  surplus: number;
  trust: number;
  congestion: number;
}

export interface Action {
  takeRate: number;
  serviceLevel: number;
  openness: number;
}

export interface Belief {
  mu: GlobalState;
  sigma: number;
}

export interface LocalState {
  energy: number;
  stress: number;
}

export type AgentType = 'platform' | 'driver' | 'regulator' | 'investor';

export type BoundaryLevel = 'B0' | 'B1' | 'B2';

export interface HistoryEntry {
  t: number;
  rBar: number;
  reward: number;
  alpha: number;
  state: GlobalState;
  totalEnergy: number;
  avgAgency: number;
  rBarB0?: number;
  rBarB1?: number;
  rBarB2?: number;
  rInstB0?: number;
  rInstB1?: number;
  rInstB2?: number;
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
  alphaQ: number;
  betaR: number;
  epsilon: number;
  numAgents: number;
  stepsPerRun: number;
  shapleyPerms: number;
  powerUpdateFreq: number;
  wSurplus: number;
  wSafety: number;
  wTrust: number;
  wCapacity: number;
  wDemand: number;
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


