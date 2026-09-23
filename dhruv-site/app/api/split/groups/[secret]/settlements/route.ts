import { NextRequest } from "next/server";
import { getDb, addSettlement } from "@/lib/split/db";
import { settlementInputSchema, noStore, errorResponse, readJson } from "@/lib/split/api";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ secret: string }> }
) {
  try {
    const { secret } = await params;
    const body = settlementInputSchema.parse(await readJson(req));
    const settlement = await addSettlement(getDb(), secret, body);
    return noStore(settlement, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
