import {
  archiveAgentConversation,
  getAgentConversation,
  normalizeAgentConversationPatch,
} from "../../../../../../db/agent-conversation-repository";
import { withOptionalDatabaseFallback } from "../../../../../../lib/live-data-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params:
    | {
        conversationId: string;
      }
    | Promise<{
        conversationId: string;
      }>;
}

async function conversationIdFromContext(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.conversationId;
}

export async function GET(_request: Request, context: RouteContext) {
  const conversationId = await conversationIdFromContext(context);

  return Response.json(
    await withOptionalDatabaseFallback(
      () => getAgentConversation(conversationId),
      { databaseConfigured: false, conversation: null },
    ),
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const conversationId = await conversationIdFromContext(context);
  const payload = await request.json().catch(() => null);
  const patch = normalizeAgentConversationPatch(payload);

  if (!patch) {
    return Response.json({ error: "Invalid agent conversation patch" }, { status: 400 });
  }

  return Response.json(
    await withOptionalDatabaseFallback(
      () => archiveAgentConversation(conversationId),
      { databaseConfigured: false, conversation: null },
    ),
  );
}
