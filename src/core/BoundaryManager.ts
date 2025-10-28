import type { BoundaryLevel } from './types';

export class BoundaryManager {
  current: BoundaryLevel = 'B0';
  // Tunable weights and couplings per boundary level (mutable via UI)
  weights: Record<BoundaryLevel, { friction: number, safety: number }> = {
    B0: { friction: 0, safety: 1.0 },
    B1: { friction: 0.35, safety: 1.1 },
    B2: { friction: 0.7, safety: 1.3 },
  };
  couplings: Record<BoundaryLevel, { congestionToCapacity: number, safetyToTrust: number }> = {
    B0: { congestionToCapacity: 0.0, safetyToTrust: 0.0 },
    B1: { congestionToCapacity: 0.04, safetyToTrust: 0.03 },
    B2: { congestionToCapacity: 0.08, safetyToTrust: 0.06 },
  };
  
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
    return this.weights[this.current];
  }
  getRewardWeightsFor(level: BoundaryLevel): { friction: number, safety: number } {
    return this.weights[level];
  }

  // Coupling strengths used by dynamics to expose externalities beyond B0
  getDynamicsCouplings(): { congestionToCapacity: number, safetyToTrust: number } {
    return this.couplings[this.current];
  }
  getDynamicsCouplingsFor(level: BoundaryLevel): { congestionToCapacity: number, safetyToTrust: number } {
    return this.couplings[level];
  }

  reset(): void {
    this.current = 'B0';
  }
}
