# Math Behind the Philosophy
## *Or: How I Learned to Stop Discounting and Love the Average Reward*

---

## The One-Sentence Version

**Most RL optimizes `Σ γᵗ Rₜ` (grab value now, discount the future), but we optimize `r* = lim (1/n) Σ Rₜ` (sustain the system forever) — and this mathematical choice makes agents regenerative instead of extractive.**

That's it. That's the whole insight. Everything else is implementation details.


---

## Why Average-Reward RL Changes Everything

### The Problem with Discount Factors

Standard RL uses a discount factor γ < 1:

```
V(s) = E[Σ γᵗ Rₜ]  where γ ≈ 0.95–0.99
```

This says: "A reward 20 timesteps from now is worth γ²⁰ ≈ 0.36× a reward today."

**Why this creates algae:**
- Agents learn "take value now, externalities hit later"
- The math *literally* tells them future costs matter less
- Even with γ = 0.99, 100 steps ahead is discounted 63%

**Real-world translation:** Uber extracting maximum commission today, knowing driver attrition hits next quarter (but that's in *discounted* future).

### The Average-Reward Alternative

We use **no discount factor**:

```
r* = lim(T→∞) (1/T) E[Σ Rₜ]
```

This says: "What's the sustainable steady-state reward per timestep?"

**Why this creates beavers:**
- No temporal myopia — step 1 = step 1000 in the math
- Agents must maintain system health indefinitely
- Extraction that tanks future rewards gets punished *immediately* in Q-values

**Real-world translation:** A platform that lowers take-rate to 2% because it realizes 25% kills driver retention, which kills the whole ecosystem it depends on.

---

## Differential Q-Learning: The Engine

Here's the actual update rule in `SpatialAgent.ts`:

```typescript
// From our codebase:
const delta = reward - this.rBar - oldQ;
this.Q.set(key, oldQ + this.alpha * delta);
this.rBar += this.beta * delta;
```

Let's unpack this:

### 1. The TD Error with Average Reward

```
δₜ = Rₜ - r̄ + Q(s', a') - Q(s, a)
```

**What each term means:**
- `Rₜ`: Reward I just got
- `r̄`: My estimate of long-run average reward (the baseline)
- `Q(s', a')`: Best value I can get from next state
- `Q(s, a)`: Value I thought current state-action had

**Key insight:** We subtract `r̄` instead of discounting future by γ.

This means:
- Getting reward R when r̄ = 50 → δ = (R - 50), so R must *beat the average* to be good
- An action that gives +60 reward but drops r̄ from 50 to 40 → net negative signal
- **The system judges actions relative to systemic health, not absolute reward**

### 2. Updating Q-Values

```
Q(s,a) ← Q(s,a) + α·δₜ
```

Standard Q-learning step. But because δ includes `-r̄`, agents learn:
- Actions that boost local reward but tank ecosystem → negative Q
- Actions that build ecosystem health → positive Q

### 3. Updating the Average Reward Estimate

```
r̄ ← r̄ + β·δₜ
```

This is the magic. As agents learn, `r̄` converges to the true long-run average `r*`.

**Why this matters:**
- If agents all extract, r̄ drops → extraction becomes negative-Q → agents learn not to extract
- If agents all invest, r̄ rises → investment gets reinforced
- **The baseline adjusts to reflect emergent system health**

---

## How This Shows Up in Simulation

In `SpatialAgent.ts`, agents have four actions:

```typescript
type AgentAction = 'stay' | 'move' | 'extract' | 'invest';
```

### Extract Action

```typescript
case 'extract': {
  const extracted = grid.extractFromCell(this.x, this.y, amount);
  this.energy += extracted;
  reward = extracted * 0.5;
  
  // Penalty for depleting cell
  if (cell.resources < 10) {
    reward -= 5;  // ← Myopic behavior punished
  }
}
```

**What happens in learning:**
- Initial r̄ might be ~20
- Extract gives +15 reward (seems good!)
- But depleting cells makes future extracts yield +2
- Over 10 steps, average drops to +5
- δ = 5 - 20 = -15 → **Q-value goes DOWN**
- Agent learns: extraction is a trap

### Invest Action

```typescript
case 'invest': {
  this.energy -= amount;
  grid.investInCell(this.x, this.y, amount);
  reward = cell.fertility * 2;  // Delayed reward
}
```

**What happens in learning:**
- Immediate reward is low (maybe +3)
- But investment boosts cell capacity & fertility
- Future extracts yield +8, +8, +8...
- Average r̄ climbs to 30
- δ = 8 - 30 = -22, but **future states have much higher Q**
- Agent learns: investment pays off

The key: **no discounting means agents care equally about reward at t=100 as t=1**.

---

## The Beaver Test: Boundaries in Code

From `EcosystemGrid.ts`, each cell has:

```typescript
interface Cell {
  resources: number;   // Energy available
  capacity: number;    // Max it can hold
  fertility: number;   // Regeneration rate
  friction: number;    // Movement cost
}
```

### Boundary 0: Agent Self-Interest

Agent's local reward function:

```typescript
const reward = extracted * 0.5 - cell.friction * 0.5;
```

This is narrow: "what I got minus what it cost me."

### Boundary 1: Local Ecosystem (5×5 neighborhood)

```typescript
private assessLocalEcosystem(grid: EcosystemGrid) {
  const stats = grid.getRegionStats(
    this.x - 2, this.y - 2,
    this.x + 2, this.y + 2
  );
  return stats.avgResources / stats.avgFriction;
}
```

Reward now includes:

```typescript
const localEcosystem = this.assessLocalEcosystem(grid);
reward += localEcosystem.health * 0.3;
```

**Effect:** Agents get rewarded for being in *healthy neighborhoods*, not just extracting.

### Boundary 2: Global System

In the simulation history, we track:

```typescript
totalSystemEnergy = totalAgentEnergy + totalEcosystemResources;
```

If this crashes, *everyone's* r̄ drops. No escape.

**The Beaver Test in math:**

```
α = r*_ecosystem / r*_network

> 1: regenerative (expanding boundary increases reward)
< 1: extractive (expanding boundary reveals hidden costs)
```

In code, we compute this by:

```typescript
const alignment = ecosystemReward / networkReward;
```

If `alignment < 1` when you widen the boundary → **you're algae, not a beaver**.

---

## Why This Falsifies Real Systems

### Hypothesis: "High take-rates (25%+) optimize long-run platform value"

**Test in simulation:**
1. Set `agent.takeRate = 0.25` for platform agents
2. Run 1000 timesteps
3. Measure:
   - r̄_platform (platform's average reward)
   - r̄_ecosystem (system-wide average reward)
   - α = r̄_ecosystem / r̄_platform

**Predicted result:**
- r̄_platform stays high short-term
- r̄_ecosystem crashes (drivers leave, riders leave)
- α < 0.5 → **FAIL**

**Real-world parallel:** Uber's 25% commission vs. Namma Yatri's 0%.

### Hypothesis: "Zero take-rate is unsustainable"

**Test in simulation:**
1. Set `agent.takeRate = 0.0` for platform
2. Platform has fixed operating cost
3. Run simulation

**Predicted result:**
- If operating cost > subscription revenue → platform dies
- But if subscription covers cost → **α > 1** at all scales
- **The math shows the boundary conditions for viability**

This lets us *predict* tipping points, not just guess.

---

## The RL Theory Grounding (Wan et al. 2021) proves

**Theorem (Differential Q-Learning Convergence):**

If:
1. MDP is communicating (no dead-end states)
2. All state-action pairs visited infinitely often (this is the "spherical cow" version of RL that makes it work)
3. Step sizes decay appropriately (α → 0, but slowly)

Then:
```
r̄ → r*  almost surely
Q → q* (optimal differential Q-function)
```

**Translation:** Our agents will *provably* learn the true long-run optimal policy, not just a myopic one.

**Why this matters:**
- It's not vibes — it's a convergence theorem
- The math guarantees agents discover regenerative strategies *if they exist*
- If simulation shows r̄ → 0, **the system math proves it's unsustainable**, not our bias

---

## The Energy Flow Equation (Implementation)

In `EcosystemGrid.ts`, cells regenerate:

```typescript
regenerate(): void {
  const fillRatio = cell.resources / cell.capacity;
  const growthRate = cell.fertility * (1 - fillRatio);  // Logistic growth
  
  const neighborBonus = this.getNeighborResourceBonus(x, y);
  const growth = growthRate * capacity * 0.05 + neighborBonus;
  
  cell.resources = clamp(resources + growth, 0, capacity);
}
```

**This encodes thermodynamics:**
- Logistic growth: S-curve, not exponential exploitation
- Diffusion: `neighborBonus` spreads resources (entropy-fighting)
- Capacity limit: no infinite growth

**Agents in this system must:**
- Extract < regeneration rate (or cells deplete)
- Invest to boost `fertility` and `capacity`
- **Follow the thermodynamic constraint: ΔS_total ≥ 0**

If they don't, r̄ → 0 and the RL controller learns to stop them.

---
## Key Parameters (Tune These for Your System)

From our actual config:

```typescript
const DEFAULT_CONFIG = {
  alphaQ: 0.1,        // Q-learning rate (how fast to update beliefs)
  betaR: 0.01,        // r̄ update rate (how fast baseline adapts)
  epsilon: 0.2,       // Exploration rate (try new actions)
  
  // Reward function weights
  wSurplus: 0.3,      // Value distributed wealth
  wSafety: 0.25,      // Value risk management  
  wTrust: 0.2,        // Value social capital
  wCapacity: 0.15,    // Value throughput
  wDemand: 0.1,       // Value unmet needs
  
  extractionPenalty: 10,   // Cost of high take-rates
  frictionPenalty: 0.1,    // Cost of inefficiency
};
```

**How to tune:**
1. **alphaQ too high** → agents forget history, jittery learning
2. **betaR too high** → r̄ tracks noise, not true average
3. **epsilon too low** → agents get stuck in local optima
4. **epsilon too high** → agents never exploit what they learned

**Rule of thumb:** betaR should be ~10× smaller than alphaQ.

---

## Falsifiable Predictions

### Prediction 1: Convergence

**Claim:** r̄ will stabilize by timestep 200.

**Test:** Run simulation, plot `history.map(h => h.avgAgentRBar)`.

**Pass condition:** Variance in last 50 steps < 1.0

**Why it matters:** If r̄ doesn't converge, the system is chaotic or the reward function is badly designed.

---

### Prediction 2: Strategy Evolution

**Claim:** In a balanced ecosystem, investors outcompete extractors.

**Test:** 
- Start 50% extractors, 50% investors
- Run 1000 steps with respawn copying successful strategies

**Pass condition:** Final population is >70% investors

**Why it matters:** Proves regenerative strategies are evolutionarily stable.

---

### Prediction 3: Boundary Dependence

**Claim:** Alignment coefficient α depends on boundary width.

**Test:**
- Compute r* for agent (B₀)
- Compute r* for local ecosystem (B₁)  
- Compute r* for global system (B₂)
- Calculate α₁ = r*(B₁)/r*(B₀) and α₂ = r*(B₂)/r*(B₁)

**Pass condition:** If α₁ < 1 or α₂ < 1 → system is extractive

**Why it matters:** This is the Beaver Test in quantitative form.

---


## Implementation Checklist

Want to build your own Predictive Agency system? Here's the minimal stack:

### 1. State Representation
```typescript
interface SystemState {
  resources: number[];    // Per-region energy
  agents: Agent[];        // Who's where
  history: Metric[];      // Time series
}
```

### 2. Agent Q-Learning
```typescript
class Agent {
  Q: Map<StateAction, number>;
  rBar: number;
  
  update(reward: number) {
    const delta = reward - this.rBar - this.Q.get(stateAction);
    this.Q.set(stateAction, Q + alpha * delta);
    this.rBar += beta * delta;
  }
}
```

### 3. Ecosystem Dynamics
```typescript
function regenerate(cell: Cell) {
  const fillRatio = cell.resources / cell.capacity;
  const growth = cell.fertility * (1 - fillRatio) * cell.capacity * dt;
  cell.resources = clamp(cell.resources + growth, 0, cell.capacity);
}
```

### 4. Reward Function
```typescript
function computeReward(state: State, actions: Action[]): number {
  const value = weights.dot(state.metrics);
  const extraction = avg(actions.map(a => a.takeRate)) * penalty;
  const friction = state.congestion * frictionCost;
  return value - extraction - friction;
}
```

### 5. Simulation Loop
```typescript
while (t < maxSteps) {
  // 1. Agents observe and act
  for (agent of agents) {
    agent.action = agent.selectAction(state);
  }
  
  // 2. Update state
  state = dynamics(state, actions);
  
  // 3. Compute reward
  const reward = computeReward(state, actions);
  
  // 4. Update Q and r̄
  for (agent of agents) {
    agent.update(reward);
  }
  
  // 5. Regenerate ecosystem
  regenerate(state);
  
  t++;
}
```

That's it. 100 lines of pseudocode. The rest is tuning and visualization.

---

## The Punchline

**Traditional RL:** "Maximize Σ γᵗ Rₜ" → Extractive agents that discount the future

**Average-Reward RL:** "Maximize r* = (1/T) Σ Rₜ" → Regenerative agents that sustain the system

**Differential Q-Learning:** Updates Q-values using `δ = R - r̄ + Q'` instead of `δ = R + γQ'`

**Result:** Agents that pass the Beaver Test because the math *forces* them to.

---


**Code:**
- `src/core/SpatialAgent.ts` ← Where δ = R - r̄ happens
- `src/core/EcosystemGrid.ts` ← Where thermodynamics lives
- `src/core/SpatialSimulation.ts` ← Where evolution emerges

---

## Q&A 

**Q: "Isn't this just a different reward function?"**

A: Yes! But reward functions are ethical choices disguised as math. We chose one that doesn't crash.

---

**Q: "How do you prevent agents from hacking the reward?"**

A: Multiple boundaries. An agent that hacks r̄_local still fails at r̄_ecosystem. You can't fake physics.

---

**Q: "What if the system has no sustainable equilibrium?"**

A: Then r̄ → 0 and the simulation proves it. **That's the point** — we can falsify viability.

---

**Q: "Doesn't infinite horizon make planning intractable?"**

A: In theory, yes. In practice, differential Q-learning is *cheaper* than discounted because you don't need value iteration to converge — just track r̄.

---

**Q: "Could this scale to AGI alignment?"**

A: If AGI optimizes Σ γᵗ Rₜ with γ < 1, we're fucked (it'll extract and move on).

If AGI optimizes r*, it *must* maintain the ecosystem (us) or its own r̄ crashes.

So... yes? But with caveats the size of exoplanets.

---

## Closing Thought

**If your system extracts faster than it regenerates, r̄ → 0, and everyone loses.**

Beavers figured this out with zero formal education.

Can we?

---



🦫 > 🦠

---

*P.S. If an economist asks "but what if agents coordinate to hack r̄?" — tell them that's called a government, and it also needs to pass the Beaver Test.*

*P.P.S. If a philosopher asks "but what IS agency?" — hand them the code and say "compile it."*
