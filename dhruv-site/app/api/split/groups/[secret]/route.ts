import { NextRequest } from "next/server";
import { getDb, loadGroup } from "@/lib/split/db";
import { computeBalances, simplifyDebts, rawDebts } from "@/lib/split";
import { noStore, errorResponse } from "@/lib/split/api";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ secret: string }> }
) {
  try {
    const { secret } = await params;
    const state = await loadGroup(getDb(), secret);
    const memberIds = state.members.map((m) => m.id);
    const net = computeBalances(memberIds, state.expenses, state.settlements);

    return noStore({
      ...state,
      balances: {
        net,
        simplified: simplifyDebts(net),
        raw: rawDebts(state.expenses, state.settlements),
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
