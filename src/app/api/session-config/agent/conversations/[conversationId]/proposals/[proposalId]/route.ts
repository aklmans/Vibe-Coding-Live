import {
  markAgentProposalReviewed,
  normalizeAgentProposalPatch,
} from "../../../../../../../../db/agent-conversation-repository";
import { withOptionalDatabaseFallback } from "../../../../../../../../lib/live-data-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params:
    | {
        conversationId: string;
        proposalId: string;
      }
    | Promise<{
        conversationId: string;
        proposalId: string;
      }>;
}

async function paramsFromContext(context: RouteContext): Promise<{
  conversationId: string;
  proposalId: string;
}> {
  return context.params;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { conversationId, proposalId } = await paramsFromContext(context);
  const payload = await request.json().catch(() => null);
  const patch = normalizeAgentProposalPatch(payload);

  if (!patch) {
    return Response.json({ error: "Invalid agent proposal patch" }, { status: 400 });
  }

  return Response.json(
    await withOptionalDatabaseFallback(
      () => markAgentProposalReviewed(conversationId, proposalId),
      { databaseConfigured: false, proposal: null },
    ),
  );
}
