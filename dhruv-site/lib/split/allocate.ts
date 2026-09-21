import { Minor, MemberId, SplitError } from "./types";

/** Small stable string hash, used only to rotate who absorbs leftover cents. */
export function seedFrom(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Split `total` minor units across weighted members so the parts sum to
 * exactly `total`.
 *
 * Uses the largest remainder method: everyone gets their floor, then the
 * leftover units go to whoever was cut off the most. When fractional parts
 * tie (which is every equal split), the winner is chosen by rotating through
 * members using `seed`. That stops the same person absorbing the extra cent
 * on every single expense of a trip.
 */
export function allocate(
  total: Minor,
  weights: Record<MemberId, number>,
  seed: string
): Record<MemberId, Minor> {
  if (!Number.isInteger(total)) {
    throw new SplitError(`total must be an integer minor amount, got ${total}`);
  }

  const ids = Object.keys(weights).sort();
  if (ids.length === 0) {
    throw new SplitError("cannot allocate across zero members");
  }

  for (const id of ids) {
    const w = weights[id];
    if (!Number.isFinite(w) || w < 0) {
      throw new SplitError(`weight for ${id} must be a non-negative number, got ${w}`);
    }
  }

  const totalWeight = ids.reduce((s, id) => s + weights[id], 0);
  if (totalWeight <= 0) {
    throw new SplitError("total weight must be greater than zero");
  }

  // Work on magnitude so refunds (negative totals) split symmetrically.
  const sign = total < 0 ? -1 : 1;
  const magnitude = Math.abs(total);

  const floors: Record<MemberId, number> = {};
  const fractions: Record<MemberId, number> = {};
  let assigned = 0;

  for (const id of ids) {
    const exact = (magnitude * weights[id]) / totalWeight;
    const floor = Math.floor(exact);
    floors[id] = floor;
    fractions[id] = exact - floor;
    assigned += floor;
  }

  let leftover = magnitude - assigned;

  if (leftover > 0) {
    const offset = seedFrom(seed) % ids.length;
    const rotated = [...ids.slice(offset), ...ids.slice(0, offset)];

    // Highest fractional part first; rotation order breaks ties.
    const order = rotated
      .map((id, rotIndex) => ({ id, rotIndex }))
      .sort((a, b) => {
        const diff = fractions[b.id] - fractions[a.id];
        if (Math.abs(diff) > 1e-9) return diff;
        return a.rotIndex - b.rotIndex;
      });

    for (let i = 0; i < leftover; i++) {
      floors[order[i % order.length].id] += 1;
    }
    leftover = 0;
  }

  const result: Record<MemberId, Minor> = {};
  for (const id of ids) result[id] = sign * floors[id];
  return result;
}
