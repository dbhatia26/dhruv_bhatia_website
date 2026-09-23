/**
 * Server-only: every route under app/api/split returns through these, so the
 * SplitError -> 400 / NotFoundError -> 404 contract and the no-store header
 * stay consistent across handlers instead of being repeated in each one.
 */
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { SplitError } from "../types";
import { NotFoundError } from "../db";

export function noStore<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return noStore(
      {
        error: "Invalid request",
        issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      400
    );
  }
  if (err instanceof SplitError) {
    return noStore({ error: err.message }, 400);
  }
  if (err instanceof NotFoundError) {
    return noStore({ error: err.message }, 404);
  }
  console.error(err);
  return noStore({ error: "Internal server error" }, 500);
}

/** A malformed JSON body is a client error, not a 500. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new SplitError("Request body must be valid JSON");
  }
}
