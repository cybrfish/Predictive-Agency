# 🦫 Predictive Agency

**A simulation framework for understanding how individual agency shapes collective outcomes**

> *What if the difference between extractive monopolies and regenerative systems isn't morality—but mathematics?*

---

## The Core Question

When an agent acts in its own interest, is it helping or harming the larger system it inhabits?

Traditional economics says: **maximize individual reward**. The result? We get systems that look profitable locally but collapse globally—venture-backed platforms that extract value, algorithmic trading that destabilizes markets, industries that externalize costs.

**Predictive Agency** offers a different lens: *What if agents optimized for long-run systemic health instead of short-term individual gain?* 

The surprising discovery: **this isn't altruism—it's better math.**

---

## The Beaver Test: A Litmus Test for System Design

Draw a boundary around any agent or process. Measure the **usable energy** (r*) inside.

Now **expand that boundary** to include the wider ecosystem.

### Pass: The Beaver 🦫
- **Local view**: Beaver builds dam → gets food surplus ✓
- **Ecosystem view**: Dam creates wetland → more species, more total energy ✓
- **At every scale, energy increases**

### Fail: The Algae Bloom 🦠  
- **Local view**: Algae captures nutrients → rapid growth ✓
- **Ecosystem view**: Algae depletes oxygen → kills fish, collapses food web ✗
- **Looks productive narrowly, destructive widely**

**The math:**
```
For nested boundaries B₀ ⊂ B₁ ⊂ B₂:

PASS: Δr*(Bₖ → Bₖ₊₁) > 0  ∀k  (regenerative)
FAIL: Δr*(B₀ → B₁) < 0        (extractive)

Alignment coefficient:
α = r*_ecosystem / r*_local

> 1: regenerative (beaver)
≈ 1: neutral
< 1: extractive (algae)
```

This is the **Beaver Test**—and most of our economic systems are failing it.

---

## The Framework: Agency as Energy Flow

### Traditional Reinforcement Learning
Agents maximize: `Σ γᵗ R_t` (discounted future rewards)

Problem: This creates **myopic optimizers** that extract value and move on.

### Predictive Agency
Agents maximize: `r* = lim(n→∞) (1/n) Σ E[R_t]` (average reward over infinite horizon)

**Key insight**: When you optimize for the long run, you're forced to care about system sustainability. Extraction tanks future rewards → extractors get naturally selected against.

### The Infinite Game

**Jevons Paradox**: Greater efficiency doesn't reduce consumption—it increases it. Every technology that made energy extraction more efficient led to *more* energy use, not less.

We're at the same cusp with intelligence. More AI capability means more compute usage, not less. **There is no upper bound to value generation.**

The ecosystem can thrive alongside individual agents—but only when you ask: *Over what timescale do we want these to align?*

This is why it must be an infinite game. Finite games optimize for endpoints. Infinite games optimize for continuation.

### The Partial Observer

Real agents never have perfect information. **Gaussian Belief Propagation (GBP)** enables:
- Agents build imperfect world models (always the case)
- Local updates happen before global awareness
- Pockets of coordination emerge and react to local conditions
- The whole system realizes later what parts already know

This is SLAM for economics. Agents are cameras mapping a world they can't fully see.

### The Oxymoron Resolves

"Predictive agency" combines:
- **Predictive** = planning for systemic consequences with partial information
- **Agency** = autonomous choice within imperfect models

**Predicting systemic health amplifies power.** This is agency that sees around corners—even through fog.

---

## The Buddhist Perspective: Boundaries Are Arbitrary

The question "What's good?" depends entirely on who you include in "we."

- **Narrow boundary** (just my wallet): Extraction looks profitable
- **Medium boundary** (my company): Sustainability matters somewhat  
- **Wide boundary** (entire ecosystem): Regeneration becomes imperative

Traditional economics draws the boundary at the individual. Predictive agency recognizes that **you are part of the ecosystem**—your long-term survival depends on its health.

**This is thermodynamics.**

---

## What This Simulation Shows

This is a **living spatial ecosystem** where agents learn to balance extraction vs investment:

### The System
- **Grid**: 50×50 cells, each with resources, friction, capacity, fertility
- **Agents**: 100+ entities that move, extract resources, or invest to improve cells
- **Learning**: Each agent uses **Differential Q-Learning** to discover which strategies maximize long-term reward
- **Evolution**: Dead agents respawn with strategies copied from successful survivors

### The Strategies
- 🔴 **Extractors**: Take resources, deplete cells, move on (algae behavior)
- 🟢 **Investors**: Spend energy improving cells, build regenerative capacity (beaver behavior)  
- 🟡 **Balanced**: Mix of both
- 🔵 **Explorers**: Random experimentation

### What Emerges
1. **Spatial patterns**: Resource-rich zones vs depleted wastelands
2. **Population dynamics**: Extractor booms → crash → investor takeover
3. **Evolutionary pressure**: Successful strategies propagate through respawning
4. **Boundary effects**: Local optimization ≠ global optimization

---

## Key Findings (So Far)

### 1. Free Energy Requires Context
Total system energy matters, but **distribution** matters more. A system can have high energy yet be entirely captured by extractors—a robber baron economy.

Like GDP, the aggregate conceals the structure.

### 2. Scale Doesn't Always Help
"Network effects will save us" is a myth. Math shows:
```
N* = (ε B₀) / k   (break-even scale)

If k ≤ 0 (extractive per-transaction), NO SCALE SAVES YOU
```

You can't scale your way out of extractive fundamentals.

### 3. The Curvilinear Agency Curve
```
Too little agency → stagnation
Moderate agency + constraints → regeneration  
Unconstrained agency → extractive collapse
```

Maximum freedom doesn't maximize flourishing. The sweet spot is **constrained optimization toward systemic health**.

### 4. Boundaries Matter More Than Intentions
A well-intentioned agent optimizing at the wrong scale is indistinguishable from an extractive one. The boundary test reveals truth.

---

## Current Implementation

### Core Engine
- **`EcosystemGrid.ts`**: Spatial grid with resource regeneration, diffusion, and degradation
- **`SpatialAgent.ts`**: Agents with movement, extraction, investment, and differential Q-learning
- **`SpatialSimulation.ts`**: Evolutionary dynamics with respawning and strategy propagation
- **`SpatialView.svelte`**: Real-time canvas visualization

### Features
✅ Spatial resource dynamics with regeneration  
✅ Agent learning via differential Q-learning (per-agent r̄)  
✅ Four behavioral strategies (extractor, investor, balanced, explorer)  
✅ Evolutionary pressure (successful strategies spread)  
✅ Interactive interventions (deplete/enrich regions, add agents)  
✅ Real-time visualization with energy tracking  

### Experiments You Can Run
1. **80% extractors, 20% investors** → Watch collapse and recovery
2. **Deplete center** → See migration patterns emerge
3. **100% investors** → Observe high-energy equilibrium  
4. **Add extractors to stable system** → Test resilience

---

## The Future: Regenerative Rideshare

**Imagine a platform that only takes what it needs to maintain long-term health.**

Not extractive monopoly. Not maximum value capture. **Regenerative economics.**

### How It Works

The platform's take rate adjusts dynamically:
- When automation replaces drivers → costs drop → **prices drop**
- When demand surges → capacity constraints → prices adjust fairly
- When marginalized groups are excluded → incentives shift to include them
- When the platform needs maintenance → take rate rises temporarily

**The system responds to reality, not to whims of founders or VCs.**

### The Shift

Traditional platforms:
1. Subsidize growth (extract from investors)
2. Achieve monopoly
3. Extract from workers and users
4. Capture maximum value
5. Resist automation (threatens control)

Regenerative platforms:
1. Cover costs from day one
2. Adjust to environment
3. Distribute surplus fairly
4. **Welcome automation** (lowers costs for everyone)
5. Platform workers feel ownership
6. Users get fair pricing
7. Drivers (then autonomous vehicles) operate efficiently

### The Math

```
take_rate(t) = f(maintenance_cost, systemic_health, marginalized_inclusion)

NOT: take_rate = maximize(shareholder_value)
```

This is differential Q-learning in action. The platform learns r* across boundaries:
- B₀: Platform profit
- B₁: Driver welfare + user satisfaction  
- B₂: City health + environmental impact

**When automation comes, goods become cheaper. Not monopolies richer.**

This is the future predictive agency enables. The simulation proves it's mathematically viable.

---

## Limitations & Next Steps

### Current Limitations

**Critical blockers:**
- ⚠️ **Finite game with boundaries** - Agents cluster at edges. Need infinite game (toroidal topology or infinite scroll)
- ⚠️ **No Gaussian Belief Propagation** - Agents have perfect information. Need partial observability for realistic emergence
- ⚠️ **Static parameters** - Movement costs, friction, investment efficiency hardcoded. Need runtime sliders
- ⚠️ **No shifting alliances** - Agents act solo. Need coalition formation and emergent group boundaries
- ⚠️ **Simple reward function** - Doesn't capture marginalized group inclusion or holonic perspectives

**Also missing:**
- Explicit boundary detection (cluster agents, compute r* per group)
- Multi-agent types (platforms, drivers, regulators, investors with different roles)
- Communication between agents
- Continuous space (currently grid-based)
- Multiple scenarios (rideshare, supply chain, financial markets)

### Next Steps (Priority Order)

1. **Infinite Game** - Remove boundary artifacts, implement toroidal topology or infinite viewport
2. **Gaussian Belief Propagation** - Add partial observability, local emergence before global awareness
3. **Runtime Parameter Sliders** - Expose movement costs, friction, investment efficiency, regeneration rates
4. **Dynamic Boundary Detection** - Cluster agents spatially, compute r* per cluster, show alignment coefficient
5. **Multi-Agent Types** - Platforms (adaptive take rates), drivers, regulators, investors with distinct behaviors
6. **Rideshare Scenario** - Implement the regenerative economics vision with adaptive pricing
7. **Shifting Alliances** - Coalition formation, emergent group boundaries, hierarchical structures

---

## Why This Matters

**We're building proof that math can guide design.**

The simulation demonstrates what theory predicts:
- Token platforms fail the Beaver Test
- Collective action achieves higher efficiency
- Scale cannot save extractive fundamentals
- AI alignment requires optimizing the right timescale

**The demo is the argument.**

---

## The Philosophy in Code

This project embodies a shift in thinking:

**Old paradigm**: Maximize individual utility, hope for emergent good  
**New paradigm**: Optimize for systemic health, discover individual benefit follows

**Old metric**: GDP, revenue, "total value created"  
**New metric**: r* across boundaries, alignment coefficient, energy distribution

**Old question**: "How can I extract maximum value?"  
**New question**: "What boundary am I optimizing for, and who's excluded?"

When agents learn to think like ecosystems, ecosystems start to thrive.

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:5173
```

### Controls
- **Play/Pause/Step**: Control simulation
- **Reset**: New random initialization  
- **Deplete Center**: Create resource crisis
- **Enrich Center**: Add resource bounty
- **Add Extractors/Investors**: Perturb the population

### Config
Adjust initial conditions:
- Grid size (20×20 to 80×80)
- Number of agents (50 to 300)
- Strategy distribution (% extractors, investors, balanced, explorers)

---

## Theoretical Foundation

Based on:
- **Average-reward reinforcement learning** (Mahadevan 1996)
- **Differential Q-learning** (long-run optimization without discounting)
- **Shapley values** (fair attribution in cooperative games)
- **Gaussian Belief Propagation** (distributed inference under uncertainty)
- **Thermodynamics** (energy flow, dissipation, regeneration)
- **Buddhist philosophy** (interdependence, non-separation)

Inspired by:

### [Learning and Planning in Average-Reward Markov Decision Processes](https://arxiv.org/abs/2006.16318)
**Yi Wan, Abhishek Naik, Richard S. Sutton**

This paper provides the mathematical foundation for infinite games. The breakthrough: **reference-free learning**.

Traditional average-reward RL requires a baseline—some idealized reference state you define at the start. But that baseline is only ideal *for that moment*. As the environment evolves, as agents adapt, as interactions shift, the ideal changes. A system stuck optimizing against a fixed reference cannot adapt to emergent realities.

Wan, Naik, and Sutton proved you can learn without a reference state—the first off-policy model-free control algorithm that converges to actual value functions, not value-plus-offset. This unlocks adaptive systems that discover changing ideals rather than chase static targets.

**This is why the simulation doesn't hardcode "good" strategies.** Agents discover what works *now*, not what we thought would work *then*.

### [The Profit Paradox](https://youtu.be/c1zssAsg9ZY?si=m6G6q62b6XMFimu2)
**Art of the Problem (YouTube)**

Where the **Beaver Test** comes from. 

One of the most influential pieces of media I've encountered—it fundamentally changed how I see agency and value creation. The video elegantly shows why local optimization (profit maximization) diverges from systemic health, and why some processes regenerate while others extract.

If you watch one thing to understand this project's core insight, watch this.

### [Representation Vs. Reality: Why We Need a Process Economy Now](https://return2process.substack.com/p/representation-vs-reality-why-we)
**Marcus Barrick**

This essay liberated me from product-based thinking. The shift to **process-based thinking** is what makes this simulation possible.

Agents aren't optimizing for static products or fixed boundaries—they're RL processes within a process economy. Each agent continuously updates internal parameters based on limited environmental understanding, driven by the desire to maximize agency (simulated via "reward flow"). Energy flow defines collective health.

When agents interplay, you get a **landscape of states connected by weighted action spaces**—a continuously evolving mapping of which actions lead to better long-term vs short-term outcomes. Boundaries between groups aren't fixed lines but shifting definitions. In-group/out-group, long-term/short-term—these aren't discrete categories but fluid gradients.

The organism living within the system must organically evolve its own information and environmental interactions. This evolutionary dance of agents with imperfect information, learning from local rewards, optimizing over time—**this is the playground for reinforcement learning**. It's why we see complexity among intelligent agents.

And here's the key insight: **nature itself is an intelligent agent**. There is emergent intelligence arising from the collective behavior of individual agents forming an ecosystem. The ecosystem has its own momentum, its own agency, within a wider world of other ecosystems.

This is process philosophy meeting RL—and it reveals why static representations always fail to capture living systems.

---

## Contributing

This is an open exploration. Contributions welcome:
- New scenarios (supply chains, financial markets, social networks)
- Better visualizations (3D, WebGL, audio feedback)
- Theoretical extensions (communication, hierarchy, evolution)
- Real-world data integration (actual take rates, emissions, etc.)

---

## License

MIT

---

## Citation

If this framework influences your work, cite as:

```
Predictive Agency: A Simulation Framework for Understanding Agency-Energy Dynamics in Complex Systems
https://github.com/cybrfish/predictive-agency
```

---

**The difference between algae and beavers is mathematical.**  
**Let's build systems that pass the test.** 🦫

---

*"The boundary you draw determines the truth you see."*

