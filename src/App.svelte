  <script lang="ts">
  import { SpatialSimulation, DEFAULT_SPATIAL_CONFIG } from './core/SpatialSimulation';
  import SpatialView from './components/SpatialView.svelte';
  import Plot from './components/Plot.svelte';
  import MultiSeriesPlot from './components/MultiSeriesPlot.svelte';

  let sim: SpatialSimulation;
  let spatialView: SpatialView | null = null;
  let running = false;
  let frame: ReturnType<typeof setTimeout> | null = null;
  
  // Simulation config
  let numAgents = DEFAULT_SPATIAL_CONFIG.numAgents;
  let gridSize = DEFAULT_SPATIAL_CONFIG.gridWidth;
  let extractorPct = DEFAULT_SPATIAL_CONFIG.strategyMix.extractor * 100;
  let investorPct = DEFAULT_SPATIAL_CONFIG.strategyMix.investor * 100;
  let balancedPct = DEFAULT_SPATIAL_CONFIG.strategyMix.balanced * 100;
  let explorerPct = DEFAULT_SPATIAL_CONFIG.strategyMix.explorer * 100;
  
  function init() {
    if (frame) clearTimeout(frame);
    running = false;
    
    const config = {
      gridWidth: gridSize,
      gridHeight: gridSize,
      numAgents: numAgents,
      strategyMix: {
        extractor: extractorPct / 100,
        investor: investorPct / 100,
        balanced: balancedPct / 100,
        explorer: explorerPct / 100,
      },
    };
    
    sim = new SpatialSimulation(config);
    sim = sim; // Trigger reactivity
  }
  
  function toggle() {
    running = !running;
    if (running) {
      loop();
    }
  }
  
  function loop() {
    if (!running || !sim) return;
    sim.step();
    if (spatialView) {
      spatialView.render();
    }
    sim = sim; // trigger reactivity
    frame = setTimeout(loop, 50);
  }
  
  function manualStep() {
    if (sim) {
      sim.step();
      if (spatialView) {
        spatialView.render();
      }
      sim = sim;
    }
  }

  function depleteCenter() {
    if (sim) {
      const cx = Math.floor(sim.grid.width / 2);
      const cy = Math.floor(sim.grid.height / 2);
      sim.depleteRegion(cx, cy, 10);
      if (spatialView) spatialView.render();
    }
  }

  function enrichCenter() {
    if (sim) {
      const cx = Math.floor(sim.grid.width / 2);
      const cy = Math.floor(sim.grid.height / 2);
      sim.enrichRegion(cx, cy, 10);
      if (spatialView) spatialView.render();
    }
  }

  function addExtractors() {
    if (sim) {
      sim.addAgents(10, 'extractor');
      sim = sim;
    }
  }

  function addInvestors() {
    if (sim) {
      sim.addAgents(10, 'investor');
      sim = sim;
    }
  }

  // initialize on load
  init();
</script>

<main>
  <header>
    <h1>🦫 Predictive Agency: Spatial Ecosystem</h1>
    <p>Watch agents learn to balance extraction vs investment in a living grid</p>
  </header>
  
  <section class="controls">
    <div class="control-row">
      <button on:click={toggle}>{running ? '⏸ Pause' : '▶ Play'}</button>
      <button on:click={manualStep}>⏭ Step</button>
      <button on:click={init}>🔄 Reset</button>
    </div>
    
    <div class="control-row">
      <button on:click={depleteCenter}>💥 Deplete Center</button>
      <button on:click={enrichCenter}>✨ Enrich Center</button>
      <button on:click={addExtractors}>➕ Add 10 Extractors</button>
      <button on:click={addInvestors}>➕ Add 10 Investors</button>
    </div>
    
    {#if sim}
      <div class="config-panel">
        <h3>Initial Configuration (requires reset)</h3>
        <div class="sliders">
          <label>
            Grid Size: {gridSize}×{gridSize}
            <input type="range" min="20" max="80" step="5" bind:value={gridSize} />
          </label>
          
          <label>
            Num Agents: {numAgents}
            <input type="range" min="50" max="300" step="10" bind:value={numAgents} />
          </label>
          
          <label>
            Extractors: {extractorPct.toFixed(0)}%
            <input type="range" min="0" max="100" step="5" bind:value={extractorPct} />
          </label>
          
          <label>
            Investors: {investorPct.toFixed(0)}%
            <input type="range" min="0" max="100" step="5" bind:value={investorPct} />
          </label>
          
          <label>
            Balanced: {balancedPct.toFixed(0)}%
            <input type="range" min="0" max="100" step="5" bind:value={balancedPct} />
          </label>
          
          <label>
            Explorers: {explorerPct.toFixed(0)}%
            <input type="range" min="0" max="100" step="5" bind:value={explorerPct} />
          </label>
        </div>
      </div>
    {/if}
  </section>

  {#if sim}
    <div class="stats">
      <span>⏱ t={sim.t}</span>
      <span>👥 Alive={sim.history[sim.history.length - 1]?.aliveAgents || 0}/{sim.config.numAgents}</span>
      <span>🔴 Extractors={sim.history[sim.history.length - 1]?.extractors || 0}</span>
      <span>🟢 Investors={sim.history[sim.history.length - 1]?.investors || 0}</span>
      <span>⚡ System Energy={sim.history[sim.history.length - 1]?.totalSystemEnergy.toFixed(0) || 0}</span>
      <span>📊 Avg r̄={sim.history[sim.history.length - 1]?.avgAgentRBar.toFixed(2) || '0.00'}</span>
    </div>
  {/if}
  
  <section class="visualization">
    {#if sim}
      <div class="spatial-container">
        <SpatialView bind:this={spatialView} simulation={sim} />
      </div>
      
      <div class="plots-grid">
        <MultiSeriesPlot 
          history={sim.history}
          series={[
            { key: 'totalAgentEnergy', label: 'Agent Energy', color: '#2ca02c' },
            { key: 'totalEcosystemResources', label: 'Ecosystem Resources', color: '#ff7f0e' },
            { key: 'totalSystemEnergy', label: 'Total System', color: '#1f77b4' },
          ]}
          title="Energy Distribution"
        />

        <MultiSeriesPlot 
          history={sim.history}
          series={[
            { key: 'extractors', label: 'Extractors', color: '#ff4444' },
            { key: 'investors', label: 'Investors', color: '#44ff44' },
            { key: 'aliveAgents', label: 'Total Alive', color: '#4444ff' },
          ]}
          title="Agent Population by Strategy"
        />

        <Plot 
          data={sim.history}
          title="Average Agent r̄ (Learned Reward)"
          yKey="avgAgentRBar"
        />

        <Plot 
          data={sim.history}
          title="Average Contribution (k)"
          yKey="avgContribution"
        />

        <Plot 
          data={sim.history}
          title="Average Cell Resources"
          yKey="avgCellResources"
        />

        <Plot 
          data={sim.history}
          title="Average Cell Friction"
          yKey="avgCellFriction"
        />
      </div>
    {/if}
  </section>
</main>

<style>
  main { 
    padding: 2rem; 
    max-width: 1400px; 
    margin: 0 auto;
    font-family: system-ui, sans-serif;
    background: #0a0a0a;
    color: #e0e0e0;
    min-height: 100vh;
  }
  
  header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  header h1 {
    margin: 0;
    font-size: 2.5rem;
    background: linear-gradient(135deg, #44ff44, #4444ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  header p {
    color: #888;
    font-size: 1.1rem;
  }
  
  .controls { 
    margin: 2rem 0; 
    display: flex; 
    flex-direction: column;
    gap: 1rem;
    background: #1a1a1a;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #333;
  }
  
  .control-row {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  button { 
    padding: 0.6rem 1.2rem; 
    font-size: 1rem;
    background: #2a2a2a;
    color: #e0e0e0;
    border: 1px solid #444;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  button:hover {
    background: #3a3a3a;
    border-color: #666;
    transform: translateY(-1px);
  }
  
  button:active {
    transform: translateY(0);
  }
  
  .config-panel {
    background: #141414;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #2a2a2a;
  }
  
  .config-panel h3 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    color: #aaa;
  }
  
  .sliders {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #bbb;
  }
  
  input[type="range"] {
    width: 100%;
    cursor: pointer;
  }
  
  .stats {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
    padding: 1rem;
    background: #1a1a1a;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 0.95rem;
    margin-bottom: 2rem;
  }
  
  .stats span {
    padding: 0.5rem 1rem;
    background: #0f0f0f;
    border-radius: 6px;
    border: 1px solid #2a2a2a;
  }
  
  .visualization { 
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .spatial-container {
    display: flex;
    justify-content: center;
    background: #000;
    padding: 2rem;
    border-radius: 12px;
    border: 2px solid #333;
  }
  
  .plots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }
</style>


