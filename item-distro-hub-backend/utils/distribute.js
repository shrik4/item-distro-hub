// utils/distribute.js
/**
 * Distribute items evenly among exactly 5 agents (agentIds length should be 5).
 * If less than 5 agents provided, will still distribute among available agents.
 *
 * Algorithm:
 * 1) Let total = items.length
 * 2) base = Math.floor(total / n)  // n is number of agents
 * 3) remainder = total % n
 * 4) Each agent gets base items
 * 5) First `remainder` agents get +1 item sequentially
 *
 * Returns an array of objects: [{ agentId, items: [] }, ...]
 *
 */

function distributeItemsAmongAgents(items, agentIds) {
  if (!Array.isArray(items)) throw new Error('items must be array');
  if (!Array.isArray(agentIds) || agentIds.length === 0) throw new Error('agentIds must be non-empty array');

  const total = items.length;
  const n = agentIds.length;

  const base = Math.floor(total / n);
  const remainder = total % n;

  const distributed = [];
  let cursor = 0;

  for (let i = 0; i < n; i++) {
    const extra = i < remainder ? 1 : 0;
    const take = base + extra; // number of items for this agent
    const assigned = items.slice(cursor, cursor + take);
    distributed.push({
      agentId: agentIds[i],
      items: assigned
    });
    cursor += take;
  }

  return distributed;
}

module.exports = { distributeItemsAmongAgents };