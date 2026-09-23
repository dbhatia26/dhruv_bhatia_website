import { NextRequest } from "next/server";
import { getDb, updateExpense, deleteExpense } from "@/lib/split/db";
import { expenseInputSchema, noStore, errorResponse, readJson } from "@/lib/split/api";

export const runtime = "nodejs";

type Params = { params: Promise<{ secret: string; id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { secret, id } = await params;
    const body = expenseInputSchema.parse(await readJson(req));
    const expense = await updateExpense(getDb(), secret, id, body);
    return noStore(expense);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { secret, id } = await params;
    const expense = await deleteExpense(getDb(), secret, id);
    return noStore(expense);
  } catch (err) {
    return errorResponse(err);
  }
}
