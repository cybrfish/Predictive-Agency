# Predictive Agency - Core Engine

**An interactive demo proving that AI systems can be designed for regenerative behavior through average-reward reinforcement learning.**

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## What Is This?

This is **Phase 0** of Predictive Agency: validating the core math before building fancy visualizations.

You'll see:
- 200 agents with differential Q-learning
- Average reward (r̄) converging over time
- The **Beaver Test** in action - boundary expansion revealing extractive behavior
- Two scenarios: Token Rideshare (fails) vs Open Rails (passes)

## The Core Idea

**Most systems optimize locally** (maximize my reward now).  
**Predictive Agency optimizes systemically** (maximize predicted long-term system health).

The math enforces this automatically through **average-reward RL**:
```
r* = lim(n→∞) (1/n) Σ E[R_t]
```

Agents that extract (high τ) eventually tank r* and get suppressed by the controller. No moral lecturing needed - just optimization.

## The Beaver Test

Draw a boundary around a process. Measure usable energy (r*) inside.  
Now **expand the boundary** to include the wider system.

- **Pass (Beaver):** r* increases at every scale
- **Fail (Algae):** Looks good narrowly, disaster widely

**Alignment coefficient:**
```
α = r*_ecosystem / r*_network

> 1: regenerative
≈ 1: neutral
< 1: extractive
< 0: destructive
```

## Project Structure

```
src/
├── core/
│   ├── types.ts              # Core interfaces
│   ├── Agent.ts              # Agent state machine
│   ├── DifferentialQ.ts      # Q-learning controller
│   ├── BoundaryManager.ts    # Boundary expansion logic
│   ├── PowerCalculator.ts    # Monte Carlo Shapley
│   └── Simulation.ts         # Main loop
├── scenarios/
│   └── presets.ts            # Token vs Open Rails configs
├── components/
│   ├── Plot.svelte           # D3 line charts
│   └── Metrics.svelte        # Readouts
├── tests/
│   ├── DifferentialQ.test.ts
│   ├── BoundaryTest.test.ts
│   └── PowerCalc.test.ts
└── App.svelte                # Main UI
```

## Implementation Status

**Phase 0: Core Engine (IN PROGRESS)**
- [x] Type definitions
- [x] Scenario presets
- [ ] Agent implementation
- [ ] Differential Q-learning
- [ ] Boundary manager
- [ ] Power calculator
- [ ] Simulation loop
- [ ] Minimal UI
- [ ] Unit tests

## Key Equations

**Differential Q-Learning:**
```
δ_t = R_t - r̄ + max_a' Q(s',a') - Q(s,a)
Q ← Q + α δ_t
r̄ ← r̄ + β δ_t
```

**Reward Function:**
```
R_t = w^T x_t - λ_t - κ_ρ ρ_t - κ_σ σ_t
where x_t = [demand, capacity, safety, surplus, trust, congestion]
```

## Expected Behavior

### Token Rideshare (τ=25%)
- r̄ converges to ~40-50
- α > 1 at B_0 (looks good locally)
- α < 1 at B_1 (extractive once externalities included) **← BEAVER TEST FAIL**

### Open Rails (τ=2%)
- r̄ converges to ~70-80
- α > 1 at B_0, B_1, B_2 (regenerative at all scales) **← BEAVER TEST PASS**

## Documentation

- **Full spec:** `/home/claude/IMPLEMENTATION_SPEC.md`
- **Framework:** `/home/claude/predictive-agency-framework.md`
- **PRD:** `/home/claude/predictive-agency-prd.md`

---

**"Predictive Agency: Agents that see around corners."** 🦫
