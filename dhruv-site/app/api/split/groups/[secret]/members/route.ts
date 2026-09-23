import { NextRequest } from "next/server";
import { getDb, addMember } from "@/lib/split/db";
import { memberNameSchema, noStore, errorResponse, readJson } from "@/lib/split/api";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ secret: string }> }
) {
  try {
    const { secret } = await params;
    const body = memberNameSchema.parse(await readJson(req));
    const member = await addMember(getDb(), secret, body.name);
    return noStore(member, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
