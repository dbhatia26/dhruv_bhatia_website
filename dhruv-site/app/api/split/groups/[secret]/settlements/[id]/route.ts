import { NextRequest } from "next/server";
import { getDb, deleteSettlement } from "@/lib/split/db";
import { noStore, errorResponse } from "@/lib/split/api";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ secret: string; id: string }> }
) {
  try {
    const { secret, id } = await params;
    const settlement = await deleteSettlement(getDb(), secret, id);
    return noStore(settlement);
  } catch (err) {
    return errorResponse(err);
  }
}
