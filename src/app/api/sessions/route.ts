import { isDatabaseConfigured } from "../../../db/client";
import { listLiveSessions } from "../../../db/live-data-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request) {
  return Response.json({
    databaseConfigured: isDatabaseConfigured(),
    sessions: await listLiveSessions(),
  });
}
