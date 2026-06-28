import {
  AGENT_CONVERSATION_FALLBACK,
  createAgentConversation,
  getOrCreateCurrentAgentConversation,
} from "../../../../../db/agent-conversation-repository";
import {
  dateKeyFromSearchParams,
  localeFromSearchParams,
  withOptionalDatabaseFallback,
} from "../../../../../lib/live-data-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = localeFromSearchParams(url.searchParams);
  const dateKey = dateKeyFromSearchParams(url.searchParams);

  return Response.json(
    await withOptionalDatabaseFallback(
      () => getOrCreateCurrentAgentConversation(locale, dateKey),
      AGENT_CONVERSATION_FALLBACK,
    ),
  );
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const locale = localeFromSearchParams(url.searchParams);
  const dateKey = dateKeyFromSearchParams(url.searchParams);

  return Response.json(
    await withOptionalDatabaseFallback(
      () => createAgentConversation(locale, dateKey),
      { databaseConfigured: false, conversation: null },
    ),
  );
}
