import {
  getLiveStateSnapshot,
  setLiveStateSnapshot,
} from "../../../lib/live-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(getLiveStateSnapshot());
}

export async function PATCH(request: Request) {
  const payload = await request.json().catch(() => null);
  return Response.json(setLiveStateSnapshot(payload));
}
