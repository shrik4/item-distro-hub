/**
 * Distribution algorithm for CSV items among agents
 * Evenly distributes items with fair allocation of remainders
 */

export interface CSVItem {
  firstName: string;
  phone: string;
  notes: string;
  originalRow?: number;
}

export interface DistributedItems {
  agentId: string;
  items: CSVItem[];
}

/**
 * Distributes items evenly among agents
 * Algorithm:
 * 1. Calculate base count per agent: floor(total / agentCount)
 * 2. Calculate remainder: total % agentCount
 * 3. Give base count to all agents
 * 4. Distribute remainder items sequentially to first agents
 * 
 * Example: 12 items, 5 agents
 * - Base: floor(12/5) = 2
 * - Remainder: 12 % 5 = 2
 * - Distribution: [3, 3, 2, 2, 2]
 */
export function distributeItems(
  items: CSVItem[],
  agentIds: string[]
): DistributedItems[] {
  if (items.length === 0 || agentIds.length === 0) {
    return [];
  }

  const totalItems = items.length;
  const agentCount = agentIds.length;
  
  // Calculate base allocation and remainder
  const baseCount = Math.floor(totalItems / agentCount);
  const remainder = totalItems % agentCount;

  const distributed: DistributedItems[] = [];
  let currentIndex = 0;

  // Distribute items to each agent
  for (let i = 0; i < agentCount; i++) {
    // First 'remainder' agents get baseCount + 1, rest get baseCount
    const itemsForThisAgent = i < remainder ? baseCount + 1 : baseCount;
    
    distributed.push({
      agentId: agentIds[i],
      items: items.slice(currentIndex, currentIndex + itemsForThisAgent),
    });

    currentIndex += itemsForThisAgent;
  }

  return distributed;
}

/**
 * Get distribution summary for display
 */
export function getDistributionSummary(distributed: DistributedItems[]): {
  totalItems: number;
  agentCounts: { agentId: string; count: number }[];
} {
  const totalItems = distributed.reduce((sum, d) => sum + d.items.length, 0);
  const agentCounts = distributed.map(d => ({
    agentId: d.agentId,
    count: d.items.length,
  }));

  return { totalItems, agentCounts };
}
