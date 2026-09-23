import { NextRequest } from "next/server";
import { getDb, renameMember } from "@/lib/split/db";
import { memberNameSchema, noStore, errorResponse, readJson } from "@/lib/split/api";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ secret: string; id: string }> }
) {
  try {
    const { secret, id } = await params;
    const body = memberNameSchema.parse(await readJson(req));
    const member = await renameMember(getDb(), secret, id, body.name);
    return noStore(member);
  } catch (err) {
    return errorResponse(err);
  }
}
