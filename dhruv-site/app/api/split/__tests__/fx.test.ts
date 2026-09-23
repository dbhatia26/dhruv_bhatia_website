import { describe, it, expect, vi, afterEach } from "vitest";
import { jsonRequest } from "./helpers";
import { GET as getFx } from "../fx/route";

describe("GET /api/split/fx", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns rate 1 without calling the network when from equals to", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await getFx(jsonRequest("http://test/api/split/fx?from=CAD&to=CAD", "GET"));
    expect(res.status).toBe(200);
    expect((await res.json()).rate).toBe(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("proxies a successful Frankfurter response", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ date: "2026-03-01", rates: { CAD: 0.037 } }), {
        status: 200,
      })
    );
    vi.stubGlobal("fetch", fetchSpy);
    const res = await getFx(jsonRequest("http://test/api/split/fx?from=THB&to=CAD", "GET"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ from: "THB", to: "CAD", rate: 0.037, date: "2026-03-01" });
  });

  it("caches the Frankfurter fetch for a day, so routine expense entry doesn't hit it fresh", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ date: "2026-03-01", rates: { CAD: 0.037 } }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchSpy);
    await getFx(jsonRequest("http://test/api/split/fx?from=THB&to=CAD", "GET"));
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/latest?from=THB&to=CAD"),
      expect.objectContaining({ next: { revalidate: 86_400 } })
    );
  });

  it("404s when Frankfurter has no rate for the pair", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ rates: {} }), { status: 200 }))
    );
    const res = await getFx(jsonRequest("http://test/api/split/fx?from=VND&to=CAD", "GET"));
    expect(res.status).toBe(404);
  });

  it("404s when the provider responds with an error status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })));
    const res = await getFx(jsonRequest("http://test/api/split/fx?from=XXX&to=CAD", "GET"));
    expect(res.status).toBe(404);
  });

  it("400s on a malformed currency code", async () => {
    const res = await getFx(jsonRequest("http://test/api/split/fx?from=CA&to=CAD", "GET"));
    expect(res.status).toBe(400);
  });
});
