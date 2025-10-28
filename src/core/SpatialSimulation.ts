/**
 * SpatialSimulation: Grid-based ecosystem with moving agents
 * Implements the Beaver Test with emergent boundaries
 */

import { EcosystemGrid } from './EcosystemGrid';
import { SpatialAgent, type AgentStrategy } from './SpatialAgent';

export interface SpatialHistoryEntry {
  t: number;
  totalAgentEnergy: number;
  totalEcosystemResources: number;
  totalSystemEnergy: number;
  avgAgentRBar: number;
  aliveAgents: number;
  extractors: number;
  investors: number;
  avgContribution: number;
  avgAgency: number;
  avgCellResources: number;
  avgCellFriction: number;
}

export interface SimulationConfig {
  gridWidth: number;
  gridHeight: number;
  numAgents: number;
  strategyMix: {
    extractor: number;   // % of agents that primarily extract
    investor: number;    // % of agents that primarily invest
    balanced: number;    // % of agents that balance both
    explorer: number;    // % of agents that explore randomly
  };
}

export const DEFAULT_SPATIAL_CONFIG: SimulationConfig = {
  gridWidth: 50,
  gridHeight: 50,
  numAgents: 100,
  strategyMix: {
    extractor: 0.3,
    investor: 0.2,
    balanced: 0.4,
    explorer: 0.1,
  },
};

export class SpatialSimulation {
  grid: EcosystemGrid;
  agents: SpatialAgent[] = [];
  t: number = 0;
  history: SpatialHistoryEntry[] = [];
  config: SimulationConfig;
  
  constructor(config: SimulationConfig = DEFAULT_SPATIAL_CONFIG) {
    this.config = config;
    this.grid = new EcosystemGrid(config.gridWidth, config.gridHeight);
    this.initializeAgents();
  }
  
  private initializeAgents(): void {
    const { numAgents, strategyMix } = this.config;
    const strategies: AgentStrategy[] = [];
    
    // Build strategy distribution
    strategies.push(...Array(Math.floor(numAgents * strategyMix.extractor)).fill('extractor'));
    strategies.push(...Array(Math.floor(numAgents * strategyMix.investor)).fill('investor'));
    strategies.push(...Array(Math.floor(numAgents * strategyMix.balanced)).fill('balanced'));
    strategies.push(...Array(Math.floor(numAgents * strategyMix.explorer)).fill('explorer'));
    
    // Fill remaining with balanced
    while (strategies.length < numAgents) {
      strategies.push('balanced');
    }
    
    // Shuffle strategies
    for (let i = strategies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [strategies[i], strategies[j]] = [strategies[j], strategies[i]];
    }
    
    // Create agents at random positions
    for (let i = 0; i < numAgents; i++) {
      const x = Math.floor(Math.random() * this.config.gridWidth);
      const y = Math.floor(Math.random() * this.config.gridHeight);
      const strategy = strategies[i];
      const agent = new SpatialAgent(i, x, y, strategy, 50);
      
      // Bias learning parameters based on strategy
      switch (strategy) {
        case 'extractor':
          agent.epsilon = 0.1; // Less exploration, more exploitation
          agent.beta = 0.005;   // Slower to update long-term view
          break;
        case 'investor':
          agent.epsilon = 0.15;
          agent.beta = 0.02;    // Faster to learn systemic patterns
          break;
        case 'balanced':
          agent.epsilon = 0.2;
          agent.beta = 0.01;
          break;
        case 'explorer':
          agent.epsilon = 0.5;  // Lots of exploration
          agent.beta = 0.01;
          break;
      }
      
      this.agents.push(agent);
    }
  }
  
  step(): void {
    // 1. Agents act in random order (to avoid order bias)
    const shuffled = [...this.agents].sort(() => Math.random() - 0.5);
    
    for (const agent of shuffled) {
      if (agent.isAlive()) {
        agent.act(this.grid);
      }
    }
    
    // 2. Grid regenerates resources
    this.grid.regenerate();
    
    // 3. Respawn dead agents (with strategy bias based on who's succeeding)
    this.handleRespawns();
    
    // 4. Record metrics
    this.recordHistory();
    
    this.t++;
  }
  
  private handleRespawns(): void {
    const deadAgents = this.agents.filter(a => !a.isAlive());
    
    if (deadAgents.length === 0) return;
    
    // Respawn strategy: learn from successful agents
    const aliveAgents = this.agents.filter(a => a.isAlive());
    if (aliveAgents.length === 0) {
      // Everyone dead - reset to balanced
      for (const agent of deadAgents) {
        this.respawnAgent(agent, 'balanced');
      }
      return;
    }
    
    // Find successful strategies (high energy + high contribution)
    const successfulAgents = aliveAgents
      .filter(a => a.energy > 30 && a.getContribution() > 0)
      .sort((a, b) => b.energy - a.energy);
    
    for (const agent of deadAgents) {
      // 50% chance to copy a successful strategy, 50% random
      if (successfulAgents.length > 0 && Math.random() < 0.5) {
        const model = successfulAgents[Math.floor(Math.random() * Math.min(5, successfulAgents.length))];
        this.respawnAgent(agent, model.strategy);
      } else {
        // Random strategy
        const strategies: AgentStrategy[] = ['extractor', 'investor', 'balanced', 'explorer'];
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];
        this.respawnAgent(agent, strategy);
      }
    }
  }
  
  private respawnAgent(agent: SpatialAgent, strategy: AgentStrategy): void {
    agent.x = Math.floor(Math.random() * this.config.gridWidth);
    agent.y = Math.floor(Math.random() * this.config.gridHeight);
    agent.energy = 40; // Start with less energy (penalty for dying)
    agent.strategy = strategy;
    agent.age = 0;
    agent.totalExtracted = 0;
    agent.totalInvested = 0;
    agent.Q.clear();
    agent.rBar = 0;
  }
  
  private recordHistory(): void {
    const aliveAgents = this.agents.filter(a => a.isAlive());
    
    const totalAgentEnergy = this.agents.reduce((sum, a) => sum + a.energy, 0);
    const totalEcosystemResources = this.grid.getTotalResources();
    const totalSystemEnergy = totalAgentEnergy + totalEcosystemResources;
    
    const avgAgentRBar = aliveAgents.length > 0
      ? aliveAgents.reduce((sum, a) => sum + a.rBar, 0) / aliveAgents.length
      : 0;
    
    const avgContribution = aliveAgents.length > 0
      ? aliveAgents.reduce((sum, a) => sum + a.getContribution(), 0) / aliveAgents.length
      : 0;
    
    const avgAgency = aliveAgents.length > 0
      ? aliveAgents.reduce((sum, a) => sum + a.getAgency(this.grid), 0) / aliveAgents.length
      : 0;
    
    // Count strategies
    const extractors = aliveAgents.filter(a => a.strategy === 'extractor').length;
    const investors = aliveAgents.filter(a => a.strategy === 'investor').length;
    
    // Grid stats
    let sumResources = 0;
    let sumFriction = 0;
    let cellCount = 0;
    
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        const cell = this.grid.getCell(x, y);
        if (cell) {
          sumResources += cell.resources;
          sumFriction += cell.friction;
          cellCount++;
        }
      }
    }
    
    this.history.push({
      t: this.t,
      totalAgentEnergy,
      totalEcosystemResources,
      totalSystemEnergy,
      avgAgentRBar,
      aliveAgents: aliveAgents.length,
      extractors,
      investors,
      avgContribution,
      avgAgency,
      avgCellResources: sumResources / cellCount,
      avgCellFriction: sumFriction / cellCount,
    });
  }
  
  // Reset simulation to initial conditions
  reset(): void {
    this.grid = new EcosystemGrid(this.config.gridWidth, this.config.gridHeight);
    this.agents = [];
    this.t = 0;
    this.history = [];
    this.initializeAgents();
  }
  
  // Add new agents with a specific strategy (for experiments)
  addAgents(count: number, strategy: AgentStrategy): void {
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * this.config.gridWidth);
      const y = Math.floor(Math.random() * this.config.gridHeight);
      const agent = new SpatialAgent(this.agents.length, x, y, strategy, 50);
      this.agents.push(agent);
    }
  }
  
  // Introduce a disturbance (deplete a region)
  depleteRegion(x: number, y: number, radius: number): void {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const cell = this.grid.getCell(x + dx, y + dy);
          if (cell) {
            cell.resources *= 0.1; // Deplete to 10%
          }
        }
      }
    }
  }
  
  // Enrich a region (simulate investment or natural bounty)
  enrichRegion(x: number, y: number, radius: number): void {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const cell = this.grid.getCell(x + dx, y + dy);
          if (cell) {
            cell.resources = Math.min(cell.capacity, cell.resources + 50);
            cell.fertility = Math.min(1, cell.fertility + 0.2);
          }
        }
      }
    }
  }
}

