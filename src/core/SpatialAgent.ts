/**
 * SpatialAgent: Agent that moves on a grid, extracts/invests in cells
 * Implements predictive agency via differential Q-learning
 */

import type { EcosystemGrid, Cell } from './EcosystemGrid';

export type AgentStrategy = 'extractor' | 'investor' | 'balanced' | 'explorer';

export interface SpatialAgentState {
  x: number;
  y: number;
  energy: number;
  strategy: AgentStrategy;
  age: number;
  totalExtracted: number;
  totalInvested: number;
}

export class SpatialAgent {
  id: number;
  x: number;
  y: number;
  energy: number;
  strategy: AgentStrategy;
  age: number = 0;
  
  // RL state
  Q: Map<string, number> = new Map();
  rBar: number = 0;           // Individual average reward estimate
  
  // Tracking for contribution metric
  totalExtracted: number = 0;
  totalInvested: number = 0;
  
  // Movement
  vx: number = 0;
  vy: number = 0;
  
  // Learning parameters
  alpha: number = 0.1;        // Q-learning rate
  beta: number = 0.01;        // Average reward learning rate
  epsilon: number = 0.2;      // Exploration rate
  gamma: number = 0.95;       // Future discount (for relative values)
  
  constructor(id: number, x: number, y: number, strategy: AgentStrategy, initialEnergy: number = 50) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.energy = initialEnergy;
    this.strategy = strategy;
  }
  
  // Agent decides action and acts on the grid
  act(grid: EcosystemGrid): void {
    this.age++;
    
    // Get local observations
    const cell = grid.getCell(this.x, this.y);
    if (!cell) return;
    
    // Decide action based on strategy and exploration
    const action = this.selectAction(grid);
    
    // Execute action
    const reward = this.executeAction(action, grid);
    
    // Update Q-learning (differential)
    this.updateQ(action, reward);
    
    // Movement consumes energy based on cell friction
    const moveCost = cell.friction * 0.5;
    this.energy -= moveCost;
    
    // Die if energy hits zero
    if (this.energy <= 0) {
      this.energy = 0;
    }
  }
  
  private selectAction(grid: EcosystemGrid): AgentAction {
    // Exploration: try random action
    if (Math.random() < this.epsilon) {
      return this.randomAction();
    }
    
    // Exploitation: choose best known action
    const actions = this.getPossibleActions(grid);
    let bestAction = actions[0];
    let maxQ = -Infinity;
    
    for (const action of actions) {
      const q = this.getQ(action);
      if (q > maxQ) {
        maxQ = q;
        bestAction = action;
      }
    }
    
    return bestAction;
  }
  
  private getPossibleActions(grid: EcosystemGrid): AgentAction[] {
    const actions: AgentAction[] = [];
    
    // Movement actions (8 directions + stay)
    const dirs = [
      { dx: 0, dy: 0, type: 'stay' as const },
      { dx: -1, dy: 0, type: 'move' as const },
      { dx: 1, dy: 0, type: 'move' as const },
      { dx: 0, dy: -1, type: 'move' as const },
      { dx: 0, dy: 1, type: 'move' as const },
    ];
    
    for (const dir of dirs) {
      const newX = this.x + dir.dx;
      const newY = this.y + dir.dy;
      if (grid.getCell(newX, newY)) {
        actions.push({ type: dir.type, dx: dir.dx, dy: dir.dy, amount: 0 });
      }
    }
    
    // Extract action (if cell has resources)
    const cell = grid.getCell(this.x, this.y);
    if (cell && cell.resources > 5) {
      actions.push({ type: 'extract', dx: 0, dy: 0, amount: 10 });
    }
    
    // Invest action (if agent has energy)
    if (this.energy > 20) {
      actions.push({ type: 'invest', dx: 0, dy: 0, amount: 5 });
    }
    
    return actions;
  }
  
  private randomAction(): AgentAction {
    const actionTypes: Array<'stay' | 'move' | 'extract' | 'invest'> = ['stay', 'move', 'extract', 'invest'];
    const type = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    
    if (type === 'move') {
      const dirs = [[-1,0], [1,0], [0,-1], [0,1]];
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      return { type, dx: dir[0], dy: dir[1], amount: 0 };
    } else if (type === 'extract') {
      return { type, dx: 0, dy: 0, amount: 10 };
    } else if (type === 'invest') {
      return { type, dx: 0, dy: 0, amount: 5 };
    } else {
      return { type: 'stay', dx: 0, dy: 0, amount: 0 };
    }
  }
  
  private executeAction(action: AgentAction, grid: EcosystemGrid): number {
    let reward = 0;
    
    switch (action.type) {
      case 'move': {
        const newX = clamp(this.x + action.dx, 0, grid.width - 1);
        const newY = clamp(this.y + action.dy, 0, grid.height - 1);
        const targetCell = grid.getCell(newX, newY);
        
        if (targetCell) {
          this.x = newX;
          this.y = newY;
          // Reward for moving to high-resource cells
          reward = targetCell.resources * 0.05 - targetCell.friction * 0.5;
        }
        break;
      }
      
      case 'extract': {
        const extracted = grid.extractFromCell(this.x, this.y, action.amount);
        this.energy += extracted;
        this.totalExtracted += extracted;
        
        // Immediate reward from extraction
        reward = extracted * 0.5;
        
        // But penalty for depleting cell (myopic behavior)
        const cell = grid.getCell(this.x, this.y);
        if (cell && cell.resources < 10) {
          reward -= 5; // Penalty for destroying local ecosystem
        }
        break;
      }
      
      case 'invest': {
        if (this.energy >= action.amount) {
          this.energy -= action.amount;
          grid.investInCell(this.x, this.y, action.amount);
          this.totalInvested += action.amount;
          
          // Delayed reward from investment (builds future capacity)
          const cell = grid.getCell(this.x, this.y);
          reward = cell ? cell.fertility * 2 : 0;
        } else {
          reward = -2; // Penalty for trying to invest without energy
        }
        break;
      }
      
      case 'stay': {
        // Small reward for staying on high-resource cells
        const cell = grid.getCell(this.x, this.y);
        reward = cell ? cell.resources * 0.02 : 0;
        break;
      }
    }
    
    // Add ecosystem health component to reward (incentivize systemic thinking)
    const localEcosystem = this.assessLocalEcosystem(grid);
    reward += localEcosystem.health * 0.3;
    
    return reward;
  }
  
  private assessLocalEcosystem(grid: EcosystemGrid): { health: number; totalResources: number } {
    // Look at 5x5 neighborhood
    const radius = 2;
    const stats = grid.getRegionStats(
      this.x - radius, this.y - radius,
      this.x + radius, this.y + radius
    );
    
    // Health = resources * (1 / friction)
    const health = stats.avgResources / stats.avgFriction;
    
    return {
      health,
      totalResources: stats.totalResources,
    };
  }
  
  private updateQ(action: AgentAction, reward: number): void {
    const key = this.actionKey(action);
    const oldQ = this.Q.get(key) || 0;
    
    // Differential Q-learning update
    // δ = R - r̄ + Q(s', a') - Q(s, a)
    // We don't have explicit next-state, so use current estimate
    const delta = reward - this.rBar - oldQ;
    
    // Update Q
    this.Q.set(key, oldQ + this.alpha * delta);
    
    // Update average reward estimate
    this.rBar += this.beta * delta;
  }
  
  private getQ(action: AgentAction): number {
    return this.Q.get(this.actionKey(action)) || 0;
  }
  
  private actionKey(action: AgentAction): string {
    return `${action.type}_${action.dx}_${action.dy}_${action.amount}`;
  }
  
  // Compute contribution: k_i = circulation - extraction
  getContribution(): number {
    return this.totalInvested - this.totalExtracted * 0.5;
  }
  
  // Compute agency: marginal contribution to local ecosystem
  getAgency(grid: EcosystemGrid): number {
    const ecosystem = this.assessLocalEcosystem(grid);
    // Agency = how much they influence local health
    return ecosystem.health * (this.totalInvested / (this.age + 1));
  }
  
  getState(): SpatialAgentState {
    return {
      x: this.x,
      y: this.y,
      energy: this.energy,
      strategy: this.strategy,
      age: this.age,
      totalExtracted: this.totalExtracted,
      totalInvested: this.totalInvested,
    };
  }
  
  isAlive(): boolean {
    return this.energy > 0;
  }
}

interface AgentAction {
  type: 'stay' | 'move' | 'extract' | 'invest';
  dx: number;
  dy: number;
  amount: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

