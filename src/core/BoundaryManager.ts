import type { BoundaryLevel } from './types';

export class BoundaryManager {
  current: BoundaryLevel = 'B0';
  
  expand(): void {
    if (this.current === 'B0') {
      this.current = 'B1';
    } else if (this.current === 'B1') {
      this.current = 'B2';
    }
  }
  
  computeAlignmentCoefficient(rEcosystem: number, rNetwork: number): number {
    // α = r*_ecosystem / r*_network
    return rEcosystem / (rNetwork + 1e-6); // add epsilon to avoid division by zero
  }
  
  getRewardWeights(): { friction: number, safety: number } {
    switch (this.current) {
      case 'B0':
        // Network-only view, ignore externalities
        return { friction: 0, safety: 1.0 };
      case 'B1':
        // Include local externalities (congestion, safety spillovers)
        return { friction: 0.1, safety: 0.8 };
      case 'B2':
        // Include regional effects (more weight on externalities)
        return { friction: 0.2, safety: 0.6 };
      default:
        return { friction: 0, safety: 1.0 };
    }
  }

  reset(): void {
    this.current = 'B0';
  }
}
