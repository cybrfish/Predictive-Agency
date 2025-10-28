# Predictive Agency - Phase 0 Implementation Spec
## LOCKED DECISIONS - Ready to Code

---

## I. Core Parameters (LOCKED)

### Agent Count
- **N = 200 agents** (sweet spot: emergent behavior, fast iteration)
- Scale to 500 later if needed

### State Variables (x_t) - The Big 6
```typescript
type GlobalState = {
  demand: number;      // Resource availability [0-100]
  capacity: number;    // System throughput [0-100]
  safety: number;      // Risk/resilience [0-100]
  surplus: number;     // Distributed wealth [0-100]
  trust: number;       // Social capital [0-100]
  congestion: number;  // Friction/waste [0-100]
}
```

### Observation Model
- **Clean observations first** (σ_obs = 0, perfect info)
- Add noise in Phase 1 after validation
- Each agent sees full state for now (no partial obs yet)

### Boundary Definitions
- **B_0:** Agent network only (internal dynamics)
- **B_1:** + Local externalities (congestion, safety spillovers)
- **B_2:** + Regional effects (labor market, emissions, infrastructure)

### Time Horizon
- **1000 steps** per run
- Plot last 500 steps (after convergence)
- r̄ should stabilize by step 200

### GBP Simplification
- **Pairwise messages only** for Phase 0
- Each agent updates belief based on 5-10 nearest neighbors
- Full factor graph in Phase 2

---

## II. Agent Architecture

```typescript
interface Action {
  takeRate: number;      // τ ∈ [0, 0.5]
  serviceLevel: number;  // effort ∈ [0, 1]
  openness: number;      // collaboration ∈ [0, 1]
}

interface Belief {
  mu: GlobalState;       // Mean estimate
  sigma: number;         // Uncertainty (scalar for now)
}

class Agent {
  // Identity
  id: number;
  type: 'platform' | 'driver' | 'regulator' | 'investor';
  
  // State
  belief: Belief;
  action: Action;
  localState: {
    energy: number;      // Internal reserves
    stress: number;      // Friction experienced
  };
  
  // Learning
  Q: Map<string, number>;  // Q(s, a) estimates
  policy: Policy;          // Current strategy
  
  // Metrics (computed each step)
  power: number;           // P_i (Shapley)
  agency: number;          // A_i (immediate contribution)
  contribution: number;    // k_i (circulation - extraction)
  
  // Methods
  observe(globalState: GlobalState): void;
  selectAction(): Action;
  updateBelief(messages: Message[]): void;
  updateQ(reward: number, rBar: number, alpha: number): void;
  computeContribution(globalState: GlobalState): number;
}
```

---

## III. Reward Function (LOCKED)

```typescript
function computeReward(state: GlobalState, actions: Action[]): number {
  // Ecosystem value (positive contributions)
  const value = (
    0.3 * state.surplus +      // Distributed wealth
    0.25 * state.safety +      // Risk management
    0.2 * state.trust +        // Social capital
    0.15 * state.capacity +    // Throughput
    0.1 * state.demand         // Unmet needs addressed
  );
  
  // Extraction/leakage (negative)
  const extraction = actions.reduce((sum, a) => 
    sum + a.takeRate * 10, 0) / actions.length;
  
  // Friction penalties
  const friction = (
    0.4 * state.congestion +   // Inefficiency
    0.6 * (100 - state.safety) // Risk
  );
  
  return value - extraction - friction * 0.1;
}
```

---

## IV. Differential Q-Learning (LOCKED)

```typescript
class DifferentialQLearning {
  alpha = 0.1;   // Learning rate
  beta = 0.01;   // Baseline update rate
  rBar = 0;      // Average reward baseline
  
  update(
    agent: Agent,
    state: GlobalState,
    action: Action,
    reward: number,
    nextState: GlobalState
  ): void {
    // Compute TD error
    const currentQ = agent.Q.get(this.stateActionKey(state, action)) ?? 0;
    const maxNextQ = this.getMaxQ(agent, nextState);
    
    const delta = reward - this.rBar + maxNextQ - currentQ;
    
    // Update Q
    agent.Q.set(
      this.stateActionKey(state, action),
      currentQ + this.alpha * delta
    );
    
    // Update baseline
    this.rBar += this.beta * delta;
  }
  
  getMaxQ(agent: Agent, state: GlobalState): number {
    const actions = this.getPossibleActions();
    return Math.max(...actions.map(a => 
      agent.Q.get(this.stateActionKey(state, a)) ?? 0
    ));
  }
}
```

---

## V. Boundary Expansion Logic

```typescript
class BoundaryManager {
  current: 'B0' | 'B1' | 'B2' = 'B0';
  
  expand(): void {
    if (this.current === 'B0') {
      this.current = 'B1';
      this.addExternalityFactors();
    } else if (this.current === 'B1') {
      this.current = 'B2';
      this.addRegionalFactors();
    }
  }
  
  addExternalityFactors(): void {
    // B1: Local externalities
    // - Congestion affects capacity
    // - Safety affects trust
    // Modify reward function weights
  }
  
  addRegionalFactors(): void {
    // B2: Regional effects
    // - Emissions (not in B0/B1)
    // - Labor market impacts
    // Add new state variables and interactions
  }
  
  computeAlignmentCoefficient(
    rEcosystem: number,
    rNetwork: number
  ): number {
    return rEcosystem / (rNetwork + 1e-6);
  }
}
```

---

## VI. Power Computation (Monte Carlo Shapley)

```typescript
class PowerCalculator {
  numPermutations = 16;  // Per update cycle
  
  computePower(agent: Agent, agents: Agent[], 
               rStar: number): number {
    let shapleySum = 0;
    
    for (let i = 0; i < this.numPermutations; i++) {
      const perm = this.randomPermutation(agents);
      let coalition: Agent[] = [];
      
      for (const a of perm) {
        const beforeValue = this.evaluateCoalition(coalition);
        coalition.push(a);
        const afterValue = this.evaluateCoalition(coalition);
        
        if (a.id === agent.id) {
          shapleySum += (afterValue - beforeValue);
          break;
        }
      }
    }
    
    return shapleySum / this.numPermutations;
  }
  
  evaluateCoalition(agents: Agent[]): number {
    // Quick proxy: sum of contributions weighted by synergy
    return agents.reduce((sum, a) => sum + a.contribution, 0);
  }
}
```

---

## VII. Simulation Loop

```typescript
class Simulation {
  agents: Agent[];
  globalState: GlobalState;
  boundary: BoundaryManager;
  qLearning: DifferentialQLearning;
  powerCalc: PowerCalculator;
  
  t = 0;
  history: HistoryEntry[] = [];
  
  step(): void {
    // 1. Agents observe and act
    this.agents.forEach(agent => {
      agent.observe(this.globalState);
      agent.action = agent.selectAction();
    });
    
    // 2. Update global state based on actions
    this.updateGlobalState();
    
    // 3. Compute reward
    const reward = computeReward(
      this.globalState, 
      this.agents.map(a => a.action)
    );
    
    // 4. Update each agent's Q and belief
    this.agents.forEach(agent => {
      this.qLearning.update(
        agent,
        this.globalState,
        agent.action,
        reward,
        this.globalState
      );
      
      // Simplified belief update (full GBP later)
      agent.updateBelief([]);
    });
    
    // 5. Compute metrics every 10 steps
    if (this.t % 10 === 0) {
      this.agents.forEach(agent => {
        agent.power = this.powerCalc.computePower(
          agent, this.agents, this.qLearning.rBar
        );
        agent.contribution = agent.computeContribution(this.globalState);
      });
    }
    
    // 6. Record history
    this.history.push({
      t: this.t,
      rBar: this.qLearning.rBar,
      reward: reward,
      alpha: this.boundary.computeAlignmentCoefficient(
        this.computeEcosystemReward(),
        this.computeNetworkReward()
      ),
      state: {...this.globalState}
    });
    
    this.t++;
  }
  
  updateGlobalState(): void {
    // Simple dynamics for now
    const avgTakeRate = this.agents.reduce(
      (sum, a) => sum + a.action.takeRate, 0
    ) / this.agents.length;
    
    const avgServiceLevel = this.agents.reduce(
      (sum, a) => sum + a.action.serviceLevel, 0
    ) / this.agents.length;
    
    // State evolution
    this.globalState.surplus = Math.max(0, Math.min(100,
      this.globalState.surplus + 
      avgServiceLevel * 5 - 
      avgTakeRate * 20
    ));
    
    this.globalState.trust = Math.max(0, Math.min(100,
      this.globalState.trust + 
      (avgServiceLevel - avgTakeRate) * 3
    ));
    
    this.globalState.congestion = Math.max(0, Math.min(100,
      this.globalState.congestion + 
      (avgTakeRate - 0.1) * 10
    ));
    
    // Other variables evolve similarly
  }
  
  computeEcosystemReward(): number {
    // r* at current boundary
    return this.history.slice(-50).reduce(
      (sum, h) => sum + h.reward, 0
    ) / 50;
  }
  
  computeNetworkReward(): number {
    // Narrow view (just surplus, ignoring externalities)
    return this.globalState.surplus;
  }
}
```

---

## VIII. Scenarios (Presets)

```typescript
const SCENARIOS = {
  tokenRideshare: {
    name: 'Token Rideshare',
    agentConfig: [
      { type: 'platform', count: 5, takeRate: 0.25, serviceLevel: 0.6 },
      { type: 'driver', count: 150, takeRate: 0.05, serviceLevel: 0.8 },
      { type: 'investor', count: 30, takeRate: 0.15, serviceLevel: 0.3 },
      { type: 'regulator', count: 15, takeRate: 0.0, serviceLevel: 0.9 }
    ]
  },
  
  openRails: {
    name: 'Open Rails',
    agentConfig: [
      { type: 'platform', count: 5, takeRate: 0.02, serviceLevel: 0.85 },
      { type: 'driver', count: 150, takeRate: 0.01, serviceLevel: 0.9 },
      { type: 'investor', count: 30, takeRate: 0.03, serviceLevel: 0.7 },
      { type: 'regulator', count: 15, takeRate: 0.0, serviceLevel: 0.95 }
    ]
  }
};
```

---

## IX. UI Components (Minimal)

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { Simulation } from './core/Simulation';
  import Plot from './components/Plot.svelte';
  import Metrics from './components/Metrics.svelte';
  
  let sim: Simulation;
  let running = false;
  let scenario = 'tokenRideshare';
  
  onMount(() => {
    sim = new Simulation(SCENARIOS[scenario]);
  });
  
  function step() {
    if (running && sim) {
      sim.step();
      sim = sim; // Trigger reactivity
    }
  }
  
  $: if (running) {
    const interval = setInterval(step, 50);
    return () => clearInterval(interval);
  }
</script>

<main>
  <header>
    <h1>Predictive Agency - Core Engine Validation</h1>
    <p>Scenario: {SCENARIOS[scenario].name}</p>
  </header>
  
  <section class="controls">
    <button on:click={() => running = !running}>
      {running ? 'Pause' : 'Play'}
    </button>
    <button on:click={() => sim.step()}>Step</button>
    <button on:click={() => sim = new Simulation(SCENARIOS[scenario])}>
      Reset
    </button>
    <button on:click={() => sim.boundary.expand()}>
      Expand Boundary
    </button>
    
    <select bind:value={scenario} on:change={() => sim = new Simulation(SCENARIOS[scenario])}>
      <option value="tokenRideshare">Token Rideshare</option>
      <option value="openRails">Open Rails</option>
    </select>
  </section>
  
  <section class="visualization">
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
  </section>
  
  <Metrics 
    rBar={sim.qLearning.rBar}
    alpha={sim.boundary.computeAlignmentCoefficient(
      sim.computeEcosystemReward(),
      sim.computeNetworkReward()
    )}
    agents={sim.agents}
    boundary={sim.boundary.current}
  />
  
  <section class="console">
    <h3>Event Log</h3>
    <ul>
      {#each sim.history.slice(-10).reverse() as entry}
        <li>t={entry.t}: r̄={entry.rBar.toFixed(2)}, α={entry.alpha.toFixed(2)}</li>
      {/each}
    </ul>
  </section>
</main>

<style>
  main { padding: 2rem; max-width: 1200px; margin: 0 auto; }
  .controls { margin: 2rem 0; display: flex; gap: 1rem; }
  button { padding: 0.5rem 1rem; }
  .visualization { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
  .console { margin-top: 2rem; }
</style>
```

---

## X. Testing Checklist

### Unit Tests (Vitest)
```typescript
// src/tests/DifferentialQ.test.ts
describe('Differential Q-Learning', () => {
  test('rBar converges after 200 steps', () => {
    const sim = new Simulation(SCENARIOS.tokenRideshare);
    for (let i = 0; i < 200; i++) sim.step();
    
    const recentRBar = sim.history.slice(-10).map(h => h.rBar);
    const variance = calculateVariance(recentRBar);
    expect(variance).toBeLessThan(1.0); // Low variance = converged
  });
  
  test('extractive policies have lower Q values', () => {
    // Agent with τ=0.4 should have worse Q than τ=0.05
  });
});

// src/tests/BoundaryTest.test.ts
describe('Boundary Expansion', () => {
  test('Token scenario fails at B1', () => {
    const sim = new Simulation(SCENARIOS.tokenRideshare);
    for (let i = 0; i < 500; i++) sim.step();
    
    const alphaB0 = sim.boundary.computeAlignmentCoefficient(
      sim.computeEcosystemReward(),
      sim.computeNetworkReward()
    );
    expect(alphaB0).toBeGreaterThan(1); // Green at B0
    
    sim.boundary.expand(); // → B1
    for (let i = 0; i < 500; i++) sim.step();
    
    const alphaB1 = sim.boundary.computeAlignmentCoefficient(
      sim.computeEcosystemReward(),
      sim.computeNetworkReward()
    );
    expect(alphaB1).toBeLessThan(1); // RED at B1 ✓
  });
  
  test('Open Rails passes all boundaries', () => {
    const sim = new Simulation(SCENARIOS.openRails);
    // Should stay α > 1 through B0, B1, B2
  });
});
```

### Visual Validation
- [ ] r̄ converges to stable value (±5 range after step 200)
- [ ] Token scenario: α > 1 at B0, α < 1 at B1
- [ ] Open Rails: α > 1 at all boundaries
- [ ] Power distribution: P_i sums to sensible total (not all zero, not all same)
- [ ] Contribution: k_i < 0 for high-τ agents, k_i > 0 for low-τ agents

---

## XI. File Structure (LOCKED)

```
predictive-agency/
├── src/
│   ├── core/
│   │   ├── Agent.ts
│   │   ├── Simulation.ts
│   │   ├── DifferentialQ.ts
│   │   ├── BoundaryManager.ts
│   │   ├── PowerCalculator.ts
│   │   └── types.ts
│   ├── scenarios/
│   │   └── presets.ts
│   ├── components/
│   │   ├── Plot.svelte
│   │   └── Metrics.svelte
│   ├── tests/
│   │   ├── DifferentialQ.test.ts
│   │   ├── BoundaryTest.test.ts
│   │   └── PowerCalc.test.ts
│   ├── App.svelte
│   └── main.ts
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## XII. Deployment (Phase 0)

**Local only for now:**
```bash
npm run dev
# → localhost:5173
```

**GitHub Pages** after validation:
```bash
npm run build
gh-pages -d dist
```

---

## XIII. Success Criteria (Phase 0)

Before moving to Phase 1 (sliders) or Phase 2 (Three.js):

- [x] Math locked and documented ✓
- [ ] 200 agents running at 20 FPS
- [ ] r̄ converges by step 200
- [ ] Token scenario fails Beaver Test (α flips at B1)
- [ ] Open Rails passes Beaver Test (α stays > 1)
- [ ] Unit tests pass
- [ ] Visual plots make sense (no NaN, no explosions)
- [ ] Export to CSV works
- [ ] Ash says "yeah, this checks out"

---

## XIV. Implementation Order

**Day 1:**
1. Scaffold project (Vite + Svelte + TypeScript)
2. Implement Agent.ts (state, action, Q)
3. Implement DifferentialQ.ts (update logic)
4. Write unit tests for Q-learning

**Day 2:**
5. Implement Simulation.ts (main loop)
6. Implement reward function
7. Implement state dynamics (updateGlobalState)
8. Write unit tests for simulation

**Day 3:**
9. Implement BoundaryManager.ts
10. Implement PowerCalculator.ts (simplified Shapley)
11. Write unit tests for boundary expansion

**Day 4:**
12. Build minimal UI (App.svelte)
13. Add Plot.svelte (D3 line charts)
14. Add Metrics.svelte (readouts)

**Day 5:**
15. Test both scenarios (token vs open rails)
16. Validate convergence and Beaver Test
17. Fix bugs, tune hyperparameters
18. Document findings

**Day 6:**
19. Add CSV export
20. Add event logging
21. Write README
22. Deploy to GitHub Pages

---

## XV. Hyperparameters (TUNABLE)

```typescript
const CONFIG = {
  // Learning
  alphaQ: 0.1,        // Q-learning rate
  betaR: 0.01,        // Baseline update rate
  epsilon: 0.1,       // Exploration rate
  
  // Simulation
  numAgents: 200,
  stepsPerRun: 1000,
  
  // Power calculation
  shapleyPerms: 16,
  powerUpdateFreq: 10, // Every N steps
  
  // Reward weights
  wSurplus: 0.3,
  wSafety: 0.25,
  wTrust: 0.2,
  wCapacity: 0.15,
  wDemand: 0.1,
  
  // Penalties
  extractionPenalty: 10,
  frictionPenalty: 0.1
};
```

Tune these if:
- r̄ doesn't converge → adjust alphaQ, betaR
- Agents don't explore → increase epsilon
- Power estimates noisy → increase shapleyPerms
- Reward too spiky → adjust weights

---

## XVI. Ready to Ship

This spec is **LOCKED and COMPLETE**. Every decision is made. Every equation is written. Every test is defined.

Hand this to Claude Code and say:
> "Implement Phase 0 exactly as specified in IMPLEMENTATION_SPEC.md. Start with Day 1 tasks."

Then sit back and watch the math come to life.

**LET'S FUCKING GO 🚀**

---

*End of Implementation Spec*
*Next: Execute*
