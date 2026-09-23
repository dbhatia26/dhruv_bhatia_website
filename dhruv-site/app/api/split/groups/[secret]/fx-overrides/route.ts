import { NextRequest } from "next/server";
import { getDb, setFxOverride } from "@/lib/split/db";
import { fxOverrideSchema, noStore, errorResponse, readJson } from "@/lib/split/api";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ secret: string }> }
) {
  try {
    const { secret } = await params;
    const body = fxOverrideSchema.parse(await readJson(req));
    const override = await setFxOverride(getDb(), secret, body.currency, body.rate);
    return noStore(override);
  } catch (err) {
    return errorResponse(err);
  }
}
