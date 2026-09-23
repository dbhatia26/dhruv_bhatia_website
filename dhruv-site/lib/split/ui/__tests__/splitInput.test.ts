import { describe, it, expect } from "vitest";
import { reconcileExactSplit, reconcilePercentSplit } from "../splitInput";

describe("reconcileExactSplit", () => {
  it("reconciles when amounts exactly sum to the total", () => {
    const result = reconcileExactSplit(6000, "CAD", { a: "40", b: "20" });
    expect(result.ok).toBe(true);
    expect(result.spec).toEqual({ mode: "exact", amounts: { a: 4000, b: 2000 } });
    expect(result.hint).toMatch(/Adds up to/);
  });

  it("reports how much is left to allocate when undershooting", () => {
    const result = reconcileExactSplit(6000, "CAD", { a: "40" });
    expect(result.ok).toBe(false);
    expect(result.spec).toBeNull();
    expect(result.hint).toMatch(/left to allocate/);
  });

  it("reports the overage when overshooting", () => {
    const result = reconcileExactSplit(6000, "CAD", { a: "40", b: "30" });
    expect(result.ok).toBe(false);
    expect(result.hint).toMatch(/over, remove some/);
  });

  it("ignores blank entries rather than treating them as zero amounts owed", () => {
    const result = reconcileExactSplit(6000, "CAD", { a: "60", b: "" });
    expect(result.ok).toBe(true);
    expect(result.spec).toEqual({ mode: "exact", amounts: { a: 6000 } });
  });
});

describe("reconcilePercentSplit", () => {
  it("treats floating point noise as reconciled against 100", () => {
    const result = reconcilePercentSplit({ a: "33.33", b: "33.33", c: "33.34" });
    expect(result.ok).toBe(true);
    expect(result.spec).toEqual({
      mode: "percent",
      percents: { a: 33.33, b: 33.33, c: 33.34 },
    });
  });

  it("reports the shortfall in percentage points", () => {
    const result = reconcilePercentSplit({ a: "50" });
    expect(result.ok).toBe(false);
    expect(result.hint).toBe("50.0% left to allocate");
  });
});
