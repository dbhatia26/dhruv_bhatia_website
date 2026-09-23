import { NextRequest } from "next/server";
import { getFxRate, parseFxQuery } from "@/lib/split/fx";
import { noStore, errorResponse } from "@/lib/split/api";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { from, to } = parseFxQuery(req.nextUrl.searchParams);
    const rate = await getFxRate(from, to);
    return noStore(rate);
  } catch (err) {
    return errorResponse(err);
  }
}
