import type { ScenarioConfig } from '../core/types';

export const SCENARIOS: Record<string, ScenarioConfig> = {
  tokenRideshare: {
    name: 'Token Rideshare (High Extraction)',
    agentConfig: [
      { type: 'platform', count: 5, takeRate: 0.25, serviceLevel: 0.6 },
      { type: 'driver', count: 150, takeRate: 0.05, serviceLevel: 0.8 },
      { type: 'investor', count: 30, takeRate: 0.15, serviceLevel: 0.3 },
      { type: 'regulator', count: 15, takeRate: 0.0, serviceLevel: 0.9 },
    ],
  },
  
  openRails: {
    name: 'Open Rails (Low Extraction)',
    agentConfig: [
      { type: 'platform', count: 5, takeRate: 0.02, serviceLevel: 0.85 },
      { type: 'driver', count: 150, takeRate: 0.01, serviceLevel: 0.9 },
      { type: 'investor', count: 30, takeRate: 0.03, serviceLevel: 0.7 },
      { type: 'regulator', count: 15, takeRate: 0.0, serviceLevel: 0.95 },
    ],
  },
};


