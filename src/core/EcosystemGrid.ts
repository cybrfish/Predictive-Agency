/**
 * EcosystemGrid: Spatial grid of cells where agents live and interact
 * Each cell has local resources, friction, and can be modified by agents
 */

export interface Cell {
  x: number;
  y: number;
  resources: number;      // Available energy in this cell (0-100)
  friction: number;       // Movement cost multiplier (0.1-10)
  capacity: number;       // Max resources this cell can hold (10-200)
  fertility: number;      // Regeneration rate (0-1)
  modified: boolean;      // Has an agent invested to improve this cell?
  agentInvestment: number; // Cumulative agent investment
}

export class EcosystemGrid {
  width: number;
  height: number;
  cells: Cell[][];
  
  constructor(width: number = 50, height: number = 50) {
    this.width = width;
    this.height = height;
    this.cells = [];
    
    // Initialize grid with varied terrain
    for (let y = 0; y < height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < width; x++) {
        row.push(this.createCell(x, y));
      }
      this.cells.push(row);
    }
  }
  
  private createCell(x: number, y: number): Cell {
    // Create varied terrain with noise
    const noise = this.perlinNoise(x / 10, y / 10);
    
    return {
      x,
      y,
      resources: 50 + noise * 30,           // 20-80 resources
      friction: 1 + Math.abs(noise) * 2,    // 1-3 friction
      capacity: 80 + noise * 40,            // 40-120 capacity
      fertility: 0.3 + Math.abs(noise) * 0.4, // 0.3-0.7 fertility
      modified: false,
      agentInvestment: 0,
    };
  }
  
  getCell(x: number, y: number): Cell | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.cells[y][x];
  }
  
  // Agent extracts resources from a cell
  extractFromCell(x: number, y: number, amount: number): number {
    const cell = this.getCell(x, y);
    if (!cell) return 0;
    
    const extracted = Math.min(amount, cell.resources);
    cell.resources -= extracted;
    return extracted;
  }
  
  // Agent invests energy to improve a cell
  investInCell(x: number, y: number, investment: number): void {
    const cell = this.getCell(x, y);
    if (!cell) return;
    
    cell.agentInvestment += investment;
    cell.modified = true;
    
    // Investment reduces friction and increases capacity/fertility
    cell.friction = Math.max(0.1, cell.friction - investment * 0.01);
    cell.capacity = Math.min(200, cell.capacity + investment * 0.5);
    cell.fertility = Math.min(1, cell.fertility + investment * 0.005);
  }
  
  // Regenerate resources in all cells based on local conditions
  regenerate(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.cells[y][x];
        
        // Logistic growth: grows faster when below capacity
        const fillRatio = cell.resources / cell.capacity;
        const growthRate = cell.fertility * (1 - fillRatio);
        
        // Neighbor bonus: cells near high-resource cells grow faster (diffusion)
        const neighborBonus = this.getNeighborResourceBonus(x, y);
        
        const growth = growthRate * cell.capacity * 0.05 + neighborBonus;
        cell.resources = clamp(cell.resources + growth, 0, cell.capacity);
        
        // Modified cells slowly lose their improvements (decay)
        if (cell.modified && cell.agentInvestment > 0) {
          cell.agentInvestment *= 0.995;
          if (cell.agentInvestment < 0.1) {
            cell.modified = false;
            cell.agentInvestment = 0;
          }
        }
      }
    }
  }
  
  private getNeighborResourceBonus(x: number, y: number): number {
    const neighbors = this.getNeighbors(x, y);
    const avgResources = neighbors.reduce((sum, n) => sum + n.resources, 0) / neighbors.length;
    const currentCell = this.cells[y][x];
    
    // Diffusion: resources flow from high to low concentration
    return (avgResources - currentCell.resources) * 0.02;
  }
  
  getNeighbors(x: number, y: number): Cell[] {
    const neighbors: Cell[] = [];
    const dirs = [[-1,0], [1,0], [0,-1], [0,1], [-1,-1], [-1,1], [1,-1], [1,1]];
    
    for (const [dx, dy] of dirs) {
      const cell = this.getCell(x + dx, y + dy);
      if (cell) neighbors.push(cell);
    }
    
    return neighbors;
  }
  
  // Simple Perlin-like noise for terrain generation
  private perlinNoise(x: number, y: number): number {
    const sin = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (sin - Math.floor(sin)) * 2 - 1; // -1 to 1
  }
  
  // Get total ecosystem energy (all cell resources)
  getTotalResources(): number {
    let total = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        total += this.cells[y][x].resources;
      }
    }
    return total;
  }
  
  // Get average cell properties in a region
  getRegionStats(x1: number, y1: number, x2: number, y2: number): {
    avgResources: number;
    avgFriction: number;
    totalResources: number;
  } {
    let sumResources = 0;
    let sumFriction = 0;
    let count = 0;
    
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        const cell = this.getCell(x, y);
        if (cell) {
          sumResources += cell.resources;
          sumFriction += cell.friction;
          count++;
        }
      }
    }
    
    return {
      avgResources: count > 0 ? sumResources / count : 0,
      avgFriction: count > 0 ? sumFriction / count : 1,
      totalResources: sumResources,
    };
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

