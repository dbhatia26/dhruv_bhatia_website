import { NextRequest } from "next/server";
import { getDb, addExpense } from "@/lib/split/db";
import { expenseInputSchema, noStore, errorResponse, readJson } from "@/lib/split/api";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ secret: string }> }
) {
  try {
    const { secret } = await params;
    const body = expenseInputSchema.parse(await readJson(req));
    const expense = await addExpense(getDb(), secret, body);
    return noStore(expense, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
