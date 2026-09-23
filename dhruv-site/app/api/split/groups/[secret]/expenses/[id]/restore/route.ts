import { NextRequest } from "next/server";
import { getDb, restoreExpense } from "@/lib/split/db";
import { noStore, errorResponse } from "@/lib/split/api";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ secret: string; id: string }> }
) {
  try {
    const { secret, id } = await params;
    const expense = await restoreExpense(getDb(), secret, id);
    return noStore(expense);
  } catch (err) {
    return errorResponse(err);
  }
}
