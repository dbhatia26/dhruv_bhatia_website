import { NextRequest } from "next/server";
import { getDb, createGroup } from "@/lib/split/db";
import { createGroupSchema, noStore, errorResponse, readJson } from "@/lib/split/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = createGroupSchema.parse(await readJson(req));
    const result = await createGroup(getDb(), body);
    return noStore(result, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
