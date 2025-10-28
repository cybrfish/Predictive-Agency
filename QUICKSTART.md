# Quick Start Guide

**Get the Predictive Agency simulation running in 2 minutes.**

---

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/predictive-agency.git
cd predictive-agency

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser to **http://localhost:5173** (or the port shown in terminal)

---

## First Run: Watch the Magic

You'll see:
- **Canvas**: A colorful grid with moving dots
- **Controls**: Play/Pause/Step buttons
- **Metrics**: Live statistics at the top
- **Plots**: Energy and population graphs below

**Hit Play** and watch for ~30 seconds. You should see:
1. Agents (colored dots) moving around
2. Some cells turning brown (depleted) or green (rich)
3. Population numbers fluctuating
4. Energy graphs changing

---

## Understanding What You See

### The Grid (Canvas)
- **Green cells** = High resources (food for agents)
- **Brown cells** = Depleted resources
- **Blue tint** = Improved by agent investment
- **Red tint** = High friction (expensive to traverse)

### The Agents (Dots)
- 🔴 **Red** = Extractor (takes resources)
- 🟢 **Green** = Investor (improves cells)
- 🟡 **Yellow** = Balanced (mix of both)
- 🔵 **Blue** = Explorer (random)

**Bigger dots** = More energy  
**Brighter dots** = Positive contribution

### The Metrics (Top Bar)
- **t** = Time step
- **Alive** = How many agents survive
- **Extractors/Investors** = Population by strategy
- **System Energy** = Total energy in system
- **Avg r̄** = Average learned reward (higher = agents are optimistic)

---

## Your First Experiments

### Experiment 1: The Extractor Crash
**Goal**: See what happens when everyone extracts

1. Hit **Reset**
2. Slide **Extractors** to 80%
3. Slide **Investors** to 10%
4. Hit **Reset** again (to apply config)
5. Hit **Play**

**What to watch for**:
- System energy crashes initially
- Extractors die off in waves
- Investors slowly take over
- System stabilizes at lower energy

**Lesson**: Extraction without regeneration is suicide.

---

### Experiment 2: The Resource Shock
**Goal**: Test system resilience

1. Hit **Reset** to defaults (balanced)
2. Hit **Play** and wait ~500 steps
3. Hit **Pause**
4. Hit **💥 Deplete Center**
5. Hit **Play** again

**What to watch for**:
- Agents flee from center
- Migration to edges
- Center slowly regenerates
- Investors move back in

**Lesson**: Systems can recover if enough regenerative capacity remains.

---

### Experiment 3: Investor Paradise
**Goal**: Can abundance be stable?

1. Hit **Reset**
2. Slide **Investors** to 70%
3. Slide **Extractors** to 10%
4. Hit **Reset** again
5. Hit **Play**

**What to watch for**:
- High system energy
- Green everywhere
- Stable population
- Few deaths

**Then add chaos**:
6. Hit **Pause**
7. Hit **➕ Add 10 Extractors** (3-4 times)
8. Hit **Play**

**Lesson**: Regenerative systems are resilient but not invulnerable.

---

### Experiment 4: The Big World
**Goal**: See complex spatial patterns

1. Hit **Reset**
2. Slide **Grid Size** to 80×80
3. Slide **Num Agents** to 300
4. Set strategies to: 30% extractors, 30% investors, 30% balanced, 10% explorers
5. Hit **Reset** again
6. Hit **Play**

**What to watch for**:
- Regional differences emerge
- Extractors cluster and create deserts
- Investors create oases
- Complex migration patterns

**Lesson**: Scale reveals emergent structure.

---

## Pro Tips

### Controls
- **Step** = Advance one timestep (good for watching closely)
- **Pause** then **Step repeatedly** = Slow-motion analysis
- **Deplete/Enrich** while paused = Set up specific scenarios

### Configuration
- **Always hit Reset after changing sliders** (config only applies on reset)
- **Start small** (20×20, 50 agents) for fast iteration
- **Go big** (80×80, 300 agents) for cool patterns

### What to Look For
- **Agent trails** (mental image - where did they come from?)
- **Wave patterns** (extractors sweep through like locusts)
- **Stable clusters** (investors settle down)
- **Phase transitions** (sudden population crashes/recoveries)

### Performance
- Runs smoothly up to 80×80 grid with 300 agents
- If laggy, reduce grid size or agent count
- Canvas is fast, but 300 agents × 50ms updates = some CPU load

---

## Common Observations

### "Everyone dies!"
**Cause**: Too many extractors, not enough regeneration  
**Fix**: Increase investor %, or hit "Enrich Center" to add resources

### "Nothing interesting happens"
**Cause**: Too balanced, system stabilizes quickly  
**Fix**: Push extremes (80% one strategy), or add disturbances

### "Why do strategies cluster spatially?"
**Answer**: Investors improve cells → attract more investors (positive feedback). Extractors deplete cells → must keep moving.

### "Can the system fully recover from collapse?"
**Answer**: Usually yes, if SOME agents survive. Dead agents respawn with strategies copied from survivors, so successful strategies propagate.

---

## Next Steps

Once you've played with the basics:

1. **Read the full README.md** for theory and philosophy
2. **Check CHANGELOG.md** to see what's new
3. **Try the advanced experiments** in PROJECT_STATUS.md
4. **Contribute!** See CONTRIBUTING.md for how to add features

---

## Troubleshooting

### "Port already in use"
```bash
# Kill the process on that port, or Vite will auto-assign a new one
# Check terminal output for actual port
```

### "Canvas is blank"
- Check browser console for errors
- Try refreshing the page
- Make sure WebGL/Canvas is enabled

### "Agents disappear"
- They're not disappearing, they're dying (energy = 0)
- This is expected! Watch the "Alive" counter
- They respawn with new strategies

### "Plots not updating"
- Plots need at least 10-20 timesteps to render
- Hit Play and wait a few seconds
- Check that history is recording (t should increase)

---

## Getting Help

- **GitHub Issues**: Bug reports and questions
- **Discussions**: Ideas and exploration
- **README**: Full documentation
- **Code**: It's well-commented! Dive in

---

**Welcome to the ecosystem. Watch it breathe.** 🦫


