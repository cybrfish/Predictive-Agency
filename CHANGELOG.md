# Changelog

All notable changes to the Predictive Agency simulation will be documented here.

## [Unreleased]

### 🚧 Planned
- Dynamic boundary detection (spatial clustering with r* computation per group)
- Multi-agent types (platforms, drivers, regulators, investors)
- Partial observability via Gaussian Belief Propagation
- Additional scenarios (rideshare, supply chain, financial markets)
- Power metrics (Shapley values)
- Sankey energy flow diagrams

---

## [0.2.0] - 2025-10-28

### 🎉 Major Rewrite: Spatial Ecosystem

Complete rebuild from abstract state pools to living spatial grid.

#### Added
- **Spatial Grid System** (`EcosystemGrid.ts`)
  - 2D grid of cells with local properties (resources, friction, capacity, fertility)
  - Resource regeneration based on fertility and neighbor diffusion
  - Cell modification through agent investment
  - Varied terrain generation with Perlin-like noise

- **Spatial Agents** (`SpatialAgent.ts`)
  - Agents that move, extract, invest, and learn
  - Four behavioral strategies: Extractor, Investor, Balanced, Explorer
  - Per-agent differential Q-learning (individual r̄ tracking)
  - Energy-based survival (death and respawn mechanics)
  - Actions: move, extract resources, invest in cells, stay

- **Evolutionary Dynamics** (`SpatialSimulation.ts`)
  - Population dynamics with death and respawn
  - Strategy propagation (successful strategies spread)
  - Interactive interventions (deplete/enrich regions, add agents)
  - Emergent spatial patterns and agent migrations

- **Real-time Visualization** (`SpatialView.svelte`)
  - Canvas-based grid rendering
  - Cells colored by resource level (brown=depleted, green=rich)
  - Agents colored by strategy, sized by energy
  - Modified cells highlighted with blue tint
  - High-friction cells shown with red tint

- **Interactive Controls**
  - Play/Pause/Step/Reset simulation
  - Deplete Center (create resource crisis)
  - Enrich Center (add resource bounty)
  - Add 10 Extractors/Investors (population perturbation)
  - Configuration sliders for grid size, agent count, strategy distribution

#### Changed
- **Plot Components Made Generic**
  - `Plot.svelte` and `MultiSeriesPlot.svelte` now accept any history type
  - Removed hard dependency on `HistoryEntry` type
  - Support for dynamic property access via string keys

- **New Metrics Dashboard**
  - Total system energy (agents + ecosystem)
  - Population by strategy (extractors, investors, total alive)
  - Average agent r̄ (learned long-term reward)
  - Average contribution k (circulation - extraction)
  - Average cell resources and friction

- **Dark Theme UI**
  - Modern dark interface with gradient title
  - Better visual hierarchy
  - Organized control panels
  - Emoji indicators for clarity

#### Removed
- Abstract global state pool system
- Fixed agent types (platform, driver, regulator)
- Boundary manager with static weights
- Old scenario presets (tokenRideshare, openRails)
- Static power calculator

#### Fixed
- **Energy Death Spiral**: System now regenerates resources continuously
- **No Recovery**: Respawn mechanism ensures population survives
- **Static Boundaries**: Spatial structure creates emergent boundaries
- **Lack of Dynamics**: Agents now exhibit complex emergent behaviors

---

## [0.1.0] - 2025-10-XX

### Initial Implementation

#### Added
- Core simulation engine with abstract state representation
- Global state tracking (demand, capacity, safety, surplus, trust, congestion)
- Agent types: Platform, Driver, Regulator, Investor
- Differential Q-learning implementation
- Boundary manager (B0, B1, B2) with static weights
- Power calculator (simplified)
- Basic visualization with D3 plots
- Two preset scenarios: Token Rideshare vs Open Rails

#### Known Issues
- System energy collapses to zero irreversibly
- No spatial structure (abstract pools only)
- Static boundaries (just weight parameters)
- Limited emergent behavior
- No recovery mechanism

---

## Legend

- 🎉 Major feature or milestone
- ✨ New feature
- 🔧 Changed behavior
- 🐛 Bug fix
- 🚧 Work in progress
- ⚠️ Breaking change
- 📝 Documentation update

