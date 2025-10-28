<script lang="ts">
  import { SCENARIOS } from './scenarios/presets';
  let scenarioKey: keyof typeof SCENARIOS = 'tokenRideshare';
</script>

<main>
  <h1>Predictive Agency - Phase 0</h1>
  <p>Quick integration check. Presets loaded:</p>

  <label for="scenario">Scenario</label>
  <select id="scenario" bind:value={scenarioKey}>
    {#each Object.keys(SCENARIOS) as key}
      <option value={key}>{SCENARIOS[key].name}</option>
    {/each}
  </select>

  <pre style="background:#111;color:#0f0;padding:1rem;border-radius:8px;overflow:auto;">
{JSON.stringify(SCENARIOS[scenarioKey], null, 2)}
  </pre>
</main>

<style>
  main { padding: 2rem; font-family: system-ui, sans-serif; }
  h1 { margin: 0 0 1rem; }
  select { margin: 0.5rem 0 1rem; }
  pre { max-height: 40vh; }
</style>


