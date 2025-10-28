  <script lang="ts">
  import { SCENARIOS } from './scenarios/presets';
  import { Simulation } from './core/Simulation';
  import Plot from './components/Plot.svelte';

  let scenarioKey: keyof typeof SCENARIOS = 'tokenRideshare';
  let sim: Simulation | null = null;
  let running = false;
  let frame: ReturnType<typeof setTimeout> | null = null;
  
  function init() {
    sim = new Simulation(SCENARIOS[scenarioKey]);
    running = false;
    if (frame) clearTimeout(frame);
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
    sim = sim; // trigger reactivity
    frame = setTimeout(loop, 50);
  }
  
  function manualStep() {
    if (sim) {
      sim.step();
      sim = sim;
    }
  }

  function expandBoundary() {
    if (sim) {
      sim.boundary.expand();
      sim = sim;
    }
  }

  // initialize on load
  init();
</script>

<main>
  <header>
    <h1>Predictive Agency - Core Engine Validation</h1>
    <p>Scenario: {SCENARIOS[scenarioKey].name}</p>
  </header>
  
  <section class="controls">
    <button on:click={toggle}>{running ? 'Pause' : 'Play'}</button>
    <button on:click={manualStep}>Step</button>
    <button on:click={init}>Reset</button>
    <button on:click={expandBoundary}>
      Expand Boundary
    </button>
    
    <select bind:value={scenarioKey} on:change={init}>
      <option value="tokenRideshare">Token Rideshare</option>
      <option value="openRails">Open Rails</option>
    </select>
  </section>

  <div style="display:flex; gap:1rem; font-family:monospace;">
    <span>t={sim ? sim.t.toString().padStart(4, ' ') : 0}</span>
    <span>r̄={sim ? sim.qLearning.rBar.toFixed(2).padStart(6, ' ') : '0.00'}</span>
    <span>B={sim ? sim.boundary.current : 'B0'}</span>
    <span>α={sim ? sim.history[sim.history.length - 1]?.alpha.toFixed(2).padStart(5, ' ') : '1.00'}</span>
  </div>
  
  <section class="visualization">
    {#if sim}
      <Plot 
        data={sim.history}
        title="Average Reward (r̄) over Time"
        yKey="rBar"
      />
      
      <Plot 
        data={sim.history}
        title="Alignment Coefficient (α)"
        yKey="alpha"
      />
    {/if}
  </section>

  <section class="console">
    <h3>Event Log (last 5 steps)</h3>
    <pre>{JSON.stringify(sim ? sim.history.slice(-5).reverse() : [], null, 2)}</pre>
  </section>
</main>

<style>
  main { 
    padding: 2rem; 
    max-width: 1200px; 
    margin: 0 auto;
    font-family: system-ui, sans-serif;
  }
  .controls { 
    margin: 2rem 0; 
    display: flex; 
    gap: 1rem; 
    align-items: center;
  }
  button, select { 
    padding: 0.5rem 1rem; 
    font-size: 1rem;
  }
  .visualization { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); 
    gap: 2rem; 
    margin: 2rem 0;
  }
  .console { 
    margin-top: 2rem; 
  }
  pre {
    background:#111;
    color:#0f0;
    padding:1rem;
    border-radius:8px;
    overflow:auto;
    max-height: 200px;
  }
</style>


