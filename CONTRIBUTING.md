# Contributing to Predictive Agency

Thank you for your interest in contributing! This project explores how agent behavior shapes systemic outcomes—and we welcome contributions that deepen that understanding.

---

## Philosophy First

Before diving into code, understand the core insight:

> **The boundary you choose determines the truth you see.**

This simulation argues that predictive agency (optimizing for long-run systemic health) beats myopic optimization. Contributions should strengthen that argument or explore its edges.

---

## Ways to Contribute

### 1. 🧪 New Scenarios
The spatial grid is general-purpose. Add scenarios that demonstrate the Beaver Test in different domains:

**Wanted:**
- **Rideshare ecosystem**: Platform agents (set take rate), driver agents (labor), regulatory agents (constraints)
- **Supply chain**: Manufacturers, distributors, retailers with inventory and externalities
- **Financial markets**: Traders, market makers, regulators with price discovery and volatility
- **Social networks**: Content creators, platforms, users with attention and moderation
- **Climate systems**: Industries, regulators, nature with emissions and absorption

**How to add:**
1. Create new agent types in `src/core/agents/`
2. Define their action space and reward functions
3. Add scenario config in `src/scenarios/`
4. Update UI to switch between scenarios

### 2. 📊 Better Visualizations

Current viz is functional but basic. We need:
- **3D terrain view** (height = resources, color = agent density)
- **Agent trails** (show movement history)
- **Energy flow Sankey diagrams** (sources → sinks)
- **Power field heatmap** (influence gradients)
- **Alignment coefficient gauge** (passes/fails Beaver Test)
- **Audio feedback** (sonify system health)

**Tech stack:**
- Canvas 2D (current)
- Three.js / WebGL (for 3D)
- D3 force layouts (for networks)
- Tone.js (for audio)

### 3. 🧮 Theoretical Extensions

The math can go deeper:

**Communication & Cooperation**
- Message passing between agents (factor graphs)
- Coalition formation (Shapley values)
- Trust networks (repeated games)

**Partial Observability**
- Gaussian Belief Propagation (GBP)
- Noisy observations of state
- Uncertainty penalties in reward

**Hierarchy & Scale**
- Multi-level agents (individuals → firms → industries)
- Nested boundaries (B0 ⊂ B1 ⊂ B2 ⊂...)
- Cross-scale externalities

**Evolution & Learning**
- Genetic algorithms for strategy evolution
- Meta-learning (agents learn how to learn)
- Cultural transmission (agents copy neighbors)

### 4. 🔬 Real-World Calibration

Ground the simulation in reality:
- Actual take rates from platforms (Uber, DoorDash, etc.)
- Emissions data by industry
- Labor statistics (wages, hours, turnover)
- Financial market data (volatility, concentration)

Add a `data/` directory with sources and scripts to import.

### 5. 📝 Documentation & Pedagogy

Help others understand:
- **Tutorial series**: Step-by-step guides to concepts
- **Interactive demos**: Embed simulation in explanatory text
- **Video walkthroughs**: Screen recordings with narration
- **Academic paper**: Formalize the framework rigorously
- **Blog posts**: Case studies of real systems failing the Beaver Test

---

## Code Guidelines

### Structure
```
src/
├── core/
│   ├── EcosystemGrid.ts        # Spatial substrate
│   ├── SpatialAgent.ts         # Base agent class
│   ├── SpatialSimulation.ts    # Main loop
│   ├── DifferentialQ.ts        # RL algorithm (if extracted)
│   └── agents/                 # Agent type implementations
│       ├── Extractor.ts
│       ├── Investor.ts
│       └── Platform.ts
├── scenarios/
│   ├── rideshare.ts
│   ├── supply-chain.ts
│   └── presets.ts
├── components/
│   ├── SpatialView.svelte      # Main visualization
│   ├── Plot.svelte             # Time series
│   └── EnergyFlow.svelte       # Sankey diagram
└── App.svelte                  # Main UI
```

### Principles

1. **Readable Over Clever**  
   Code should teach. Add comments explaining *why*, not just *what*.

2. **Math in Comments**  
   Include equations in comments for key algorithms:
   ```typescript
   // Differential Q-learning update:
   // δ = R - r̄ + Q(s', a') - Q(s, a)
   // Q ← Q + α δ
   // r̄ ← r̄ + β δ
   const delta = reward - this.rBar - oldQ;
   ```

3. **Parameters Explicit**  
   No magic numbers. Use named constants:
   ```typescript
   const RESOURCE_REGEN_RATE = 0.05;  // 5% per step
   const INVESTMENT_EFFICIENCY = 0.5; // 50% energy → capacity
   ```

4. **Types Everywhere**  
   TypeScript strict mode. Types document intent.

5. **Small Commits**  
   One logical change per commit. Write descriptive messages.

### Testing

Currently manual (watch the simulation). Eventually:
- Unit tests for core algorithms (Q-learning updates, grid diffusion)
- Integration tests for scenarios (does extractive strategy crash?)
- Visual regression tests (snapshots of key states)

---

## Development Workflow

### Setup
```bash
# Clone and install
git clone https://github.com/yourusername/predictive-agency.git
cd predictive-agency
npm install

# Run dev server
npm run dev
```

### Adding a Feature

1. **Create a branch**
   ```bash
   git checkout -b feature/boundary-detection
   ```

2. **Implement incrementally**
   - Start with types/interfaces
   - Add core logic
   - Wire up to UI
   - Test thoroughly

3. **Document as you go**
   - Update README if user-facing
   - Add inline comments for complex logic
   - Update CHANGELOG.md

4. **Commit with context**
   ```bash
   git commit -m "Add dynamic boundary detection via DBSCAN clustering

   - Cluster agents by spatial proximity
   - Compute r* per cluster
   - Visualize boundaries on canvas
   - Update alignment coefficient to compare clusters
   
   Implements TODO #5 from original roadmap."
   ```

5. **Open a PR**
   - Describe motivation (why this matters for the argument)
   - Show before/after (screenshots or videos)
   - Explain design choices
   - Tag related issues

---

## Research Questions to Explore

These are open problems—contributions addressing them are especially valuable:

1. **Optimal Boundary Scale**  
   Is there a "right" boundary size? Or does it depend on externality propagation speed?

2. **Threshold Phenomena**  
   Does the system have phase transitions? (e.g., extractor % → collapse)

3. **Evolution Convergence**  
   Do strategies converge to Nash equilibrium? Or continuous Red Queen dynamics?

4. **Prediction Accuracy**  
   Can we forecast real-world system failures using this framework?

5. **Policy Implications**  
   What interventions most effectively shift extractive → regenerative?

---

## Community

- **Discussions**: Use GitHub Discussions for ideas and questions
- **Issues**: Bug reports and feature requests
- **Wiki**: Deep dives into theory and implementation details
- **Discord/Slack**: (TBD) Real-time chat for contributors

---

## Recognition

Contributors will be:
- Listed in README
- Credited in academic papers citing this work
- Invited to co-author if substantial theoretical contribution

---

## License

By contributing, you agree your work will be released under MIT License.

---

## Questions?

Open an issue or start a discussion. This is collaborative exploration—all perspectives welcome.

**Remember**: We're building *proof*.

🦫 > 🦠

