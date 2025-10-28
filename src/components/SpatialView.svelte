<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { SpatialSimulation } from '../core/SpatialSimulation';
  import type { EcosystemGrid, Cell } from '../core/EcosystemGrid';
  import type { SpatialAgent } from '../core/SpatialAgent';

  export let simulation: SpatialSimulation;
  
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrame: number | null = null;
  
  const CELL_SIZE = 10; // pixels per grid cell
  const AGENT_SIZE = 6;
  
  onMount(() => {
    ctx = canvas.getContext('2d');
    if (ctx) {
      render();
    }
  });
  
  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
  
  export function render() {
    if (!ctx || !canvas) return;
    
    const width = simulation.grid.width * CELL_SIZE;
    const height = simulation.grid.height * CELL_SIZE;
    
    canvas.width = width;
    canvas.height = height;
    
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid cells
    drawGrid(ctx, simulation.grid);
    
    // Draw agents
    drawAgents(ctx, simulation.agents);
  }
  
  function drawGrid(ctx: CanvasRenderingContext2D, grid: EcosystemGrid) {
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.getCell(x, y);
        if (!cell) continue;
        
        // Color based on resources (green = high, brown = low)
        const resourceRatio = cell.resources / cell.capacity;
        const r = Math.floor(50 + (1 - resourceRatio) * 100);
        const g = Math.floor(50 + resourceRatio * 150);
        const b = 30;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        
        // Show modified cells with blue tint
        if (cell.modified) {
          ctx.fillStyle = 'rgba(50, 150, 255, 0.3)';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
        
        // Show high friction cells with red tint
        if (cell.friction > 2) {
          ctx.fillStyle = 'rgba(255, 50, 50, 0.2)';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }
  
  function drawAgents(ctx: CanvasRenderingContext2D, agents: SpatialAgent[]) {
    for (const agent of agents) {
      if (!agent.isAlive()) continue;
      
      const px = agent.x * CELL_SIZE + CELL_SIZE / 2;
      const py = agent.y * CELL_SIZE + CELL_SIZE / 2;
      
      // Size based on energy
      const size = Math.max(2, Math.min(AGENT_SIZE, agent.energy / 10));
      
      // Color based on strategy
      let color: string;
      switch (agent.strategy) {
        case 'extractor':
          color = '#ff4444'; // Red
          break;
        case 'investor':
          color = '#44ff44'; // Green
          break;
        case 'balanced':
          color = '#ffff44'; // Yellow
          break;
        case 'explorer':
          color = '#4444ff'; // Blue
          break;
        default:
          color = '#ffffff';
      }
      
      // Contribution affects opacity (high contribution = brighter)
      const contribution = agent.getContribution();
      const opacity = contribution > 0 ? 1.0 : 0.5;
      
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
      
      // Outline for high-energy agents
      if (agent.energy > 80) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
</script>

<div class="spatial-view">
  <canvas bind:this={canvas}></canvas>
  
  <div class="legend">
    <h4>Legend</h4>
    <div class="legend-item">
      <div class="color-box" style="background: #44ff44;"></div>
      <span>Investor (green)</span>
    </div>
    <div class="legend-item">
      <div class="color-box" style="background: #ff4444;"></div>
      <span>Extractor (red)</span>
    </div>
    <div class="legend-item">
      <div class="color-box" style="background: #ffff44;"></div>
      <span>Balanced (yellow)</span>
    </div>
    <div class="legend-item">
      <div class="color-box" style="background: #4444ff;"></div>
      <span>Explorer (blue)</span>
    </div>
    <div class="legend-item">
      <div class="color-box" style="background: linear-gradient(90deg, #a05020, #50c850);"></div>
      <span>Cell resources (brown=low, green=high)</span>
    </div>
  </div>
</div>

<style>
  .spatial-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  canvas {
    border: 2px solid #333;
    background: #000;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }
  
  .legend {
    background: #1a1a1a;
    padding: 1rem;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
  }
  
  .legend h4 {
    margin: 0 0 0.5rem 0;
    color: #fff;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.25rem 0;
    color: #ccc;
    font-size: 0.9rem;
  }
  
  .color-box {
    width: 20px;
    height: 20px;
    border: 1px solid #666;
    border-radius: 3px;
  }
</style>

