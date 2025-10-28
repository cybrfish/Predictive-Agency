import { Agent } from './Agent';
import type { GlobalState } from './types';

export class PowerCalculator {
  // Per spec, 16 is a good balance of speed/accuracy for real-time
  numPermutations = 16;
  
  computePower(agent: Agent, agents: Agent[], rStar: number): number {
    let shapleySum = 0;
    
    for (let i = 0; i < this.numPermutations; i++) {
      // Create a random ordering of agents
      const permutation = this.shuffleArray([...agents]);
      const agentIndex = permutation.findIndex(a => a.id === agent.id);
      
      if (agentIndex === -1) continue;
      
      // Form coalition of agents appearing *before* the target agent
      const coalitionWithout = permutation.slice(0, agentIndex);
      // Add the target agent to the coalition
      const coalitionWith = [...coalitionWithout, agent];
      
      // Evaluate the characteristic function for both coalitions
      const valueWithout = this.evaluateCoalition(coalitionWithout);
      const valueWith = this.evaluateCoalition(coalitionWith);
      
      // The marginal contribution is the difference
      shapleySum += (valueWith - valueWithout);
    }
    
    // The Shapley value is the average of marginal contributions
    return shapleySum / this.numPermutations;
  }
  
  // A simple proxy for the coalition's value function
  private evaluateCoalition(agents: Agent[]): number {
    // Sum of contributions (k_i) is a good proxy for Phase 0
    if (agents.length === 0) return 0;
    const totalContribution = agents.reduce((sum, a) => sum + a.contribution, 0);
    return totalContribution / agents.length;
  }
  
  // Fisher-Yates shuffle for random permutations
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
