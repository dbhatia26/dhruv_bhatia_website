import { NextRequest } from "next/server";
import { getDb, createGroup } from "@/lib/split/db";
import { createGroupSchema, noStore, errorResponse, readJson } from "@/lib/split/api";
import { checkRateLimit, clientIp } from "@/lib/split/rateLimit";

export const runtime = "nodejs";

// Generous enough for someone planning several trips; tight enough to blunt a
// naive script spamming junk groups. See lib/split/rateLimit.ts for caveats.
const LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    checkRateLimit(`create-group:${clientIp(req)}`, LIMIT, WINDOW_MS);
    const body = createGroupSchema.parse(await readJson(req));
    const result = await createGroup(getDb(), body);
    return noStore(result, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
