/**
 * Lead Distribution Engine
 *
 * Business Rules:
 * 1. Priority providers (isPriority: true) ALWAYS receive every lead in their service category.
 * 2. From the remaining non-priority providers, up to MAX_ROUND_ROBIN are selected
 *    using a fair round-robin counter stored on each provider (leadCount).
 * 3. Total assigned = priority providers + round-robin providers (deduplicated).
 */

import Provider from '@/models/Provider';

const MAX_ROUND_ROBIN = 2; // How many non-priority providers get each lead

/**
 * Given a service category, return the list of providers to assign the lead to.
 * @param {string} serviceCategory
 * @returns {Promise<Provider[]>}
 */
export async function distributeLeadToProviders(serviceCategory) {
  // 1. Fetch all active providers that handle this service
  const allProviders = await Provider.find({
    services: serviceCategory,
    isActive: true,
  });

  if (allProviders.length === 0) return [];

  // 2. Separate priority vs non-priority
  const priorityProviders = allProviders.filter((p) => p.isPriority);
  const regularProviders = allProviders.filter((p) => !p.isPriority);

  // 3. Round-robin: pick the MAX_ROUND_ROBIN with lowest leadCount
  const roundRobinSelected = regularProviders
    .sort((a, b) => a.leadCount - b.leadCount)
    .slice(0, MAX_ROUND_ROBIN);

  // 4. Deduplicate (in case a provider is somehow in both lists)
  const assignedMap = new Map();
  for (const p of [...priorityProviders, ...roundRobinSelected]) {
    assignedMap.set(String(p._id), p);
  }
  const assigned = Array.from(assignedMap.values());

  // 5. Increment leadCount for all assigned providers atomically
  const assignedIds = assigned.map((p) => p._id);
  await Provider.updateMany({ _id: { $in: assignedIds } }, { $inc: { leadCount: 1 } });

  return assigned;
}
