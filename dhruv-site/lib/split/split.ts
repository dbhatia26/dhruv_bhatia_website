import { allocate } from "./allocate";
import { Minor, MemberId, SplitSpec, SplitError } from "./types";

/**
 * Turn a split specification into exact minor-unit amounts per member.
 * The returned values always sum to exactly `total`.
 */
export function resolveSplit(
  total: Minor,
  spec: SplitSpec,
  seed: string
): Record<MemberId, Minor> {
  switch (spec.mode) {
    case "equal": {
      const unique = [...new Set(spec.participants)];
      if (unique.length === 0) {
        throw new SplitError("an equal split needs at least one participant");
      }
      const weights: Record<MemberId, number> = {};
      for (const id of unique) weights[id] = 1;
      return allocate(total, weights, seed);
    }

    case "exact": {
      const ids = Object.keys(spec.amounts);
      if (ids.length === 0) {
        throw new SplitError("an exact split needs at least one member");
      }
      let sum = 0;
      for (const id of ids) {
        const amt = spec.amounts[id];
        if (!Number.isInteger(amt)) {
          throw new SplitError(`exact amount for ${id} must be an integer minor amount`);
        }
        sum += amt;
      }
      if (sum !== total) {
        throw new SplitError(
          `exact amounts sum to ${sum} but the expense total is ${total}`
        );
      }
      return { ...spec.amounts };
    }

    case "percent": {
      const ids = Object.keys(spec.percents);
      if (ids.length === 0) {
        throw new SplitError("a percentage split needs at least one member");
      }
      let sum = 0;
      for (const id of ids) {
        const p = spec.percents[id];
        if (!Number.isFinite(p) || p < 0) {
          throw new SplitError(`percentage for ${id} must be non-negative`);
        }
        sum += p;
      }
      // Tolerance absorbs float noise from inputs like 33.33 + 33.33 + 33.34.
      if (Math.abs(sum - 100) > 1e-6) {
        throw new SplitError(`percentages sum to ${sum}, expected 100`);
      }
      return allocate(total, spec.percents, seed);
    }

    case "shares": {
      const ids = Object.keys(spec.shares);
      if (ids.length === 0) {
        throw new SplitError("a shares split needs at least one member");
      }
      for (const id of ids) {
        const s = spec.shares[id];
        if (!Number.isFinite(s) || s < 0) {
          throw new SplitError(`share for ${id} must be non-negative`);
        }
      }
      return allocate(total, spec.shares, seed);
    }

    default: {
      const exhaustive: never = spec;
      throw new SplitError(`unknown split mode: ${JSON.stringify(exhaustive)}`);
    }
  }
}
