import {
  appendAgentMessage,
  normalizeAgentMessageInput,
} from "../../../../../../../db/agent-conversation-repository";
import { withOptionalDatabaseFallback } from "../../../../../../../lib/live-data-api";

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

export async function POST(request: Request, context: RouteContext) {
  const conversationId = await conversationIdFromContext(context);
  const payload = await request.json().catch(() => null);
  const input = normalizeAgentMessageInput(payload);

  if (!input) {
    return Response.json({ error: "Invalid agent message payload" }, { status: 400 });
  }

  return Response.json(
    await withOptionalDatabaseFallback(
      () => appendAgentMessage(conversationId, input),
      { databaseConfigured: false, message: null },
    ),
  );
}
