import type {
  AgentConversationDetailResult,
  AgentConversationListResult,
  AgentMessageInput,
  AgentMessageResult,
  AgentProposalResult,
} from "../db/agent-conversation-repository";

const ENDPOINT = "/api/session-config/agent/conversations";

const LIST_FALLBACK: AgentConversationListResult = {
  databaseConfigured: false,
  conversations: [],
  current: null,
};

const DETAIL_FALLBACK: AgentConversationDetailResult = {
  databaseConfigured: false,
  conversation: null,
};

const MESSAGE_FALLBACK: AgentMessageResult = {
  databaseConfigured: false,
  message: null,
};

const PROPOSAL_FALLBACK: AgentProposalResult = {
  databaseConfigured: false,
  proposal: null,
};

type FetchLike = typeof fetch;
type AgentMessagePayload = Omit<Partial<AgentMessageInput>, "proposal"> & {
  proposal?: {
    configText?: string;
    summaryJson?: unknown;
    status?: "draft";
  } | null;
};

export async function fetchAgentConversations(
  locale: "zh" | "en",
  dateKey: string,
  fetchImpl: FetchLike = fetch,
): Promise<AgentConversationListResult> {
  const params = new URLSearchParams({ locale, dateKey });
  try {
    const response = await fetchImpl(`${ENDPOINT}?${params.toString()}`);
    if (!response.ok) return LIST_FALLBACK;
    return (await response.json()) as AgentConversationListResult;
  } catch {
    return LIST_FALLBACK;
  }
}

export async function createAgentConversationClient(
  locale: "zh" | "en",
  dateKey: string,
  fetchImpl: FetchLike = fetch,
): Promise<AgentConversationDetailResult> {
  const params = new URLSearchParams({ locale, dateKey });
  try {
    const response = await fetchImpl(`${ENDPOINT}?${params.toString()}`, {
      method: "POST",
    });
    if (!response.ok) return DETAIL_FALLBACK;
    return (await response.json()) as AgentConversationDetailResult;
  } catch {
    return DETAIL_FALLBACK;
  }
}

export async function fetchAgentConversation(
  conversationId: string,
  fetchImpl: FetchLike = fetch,
): Promise<AgentConversationDetailResult> {
  try {
    const response = await fetchImpl(`${ENDPOINT}/${encodeURIComponent(conversationId)}`);
    if (!response.ok) return DETAIL_FALLBACK;
    return (await response.json()) as AgentConversationDetailResult;
  } catch {
    return DETAIL_FALLBACK;
  }
}

export async function archiveAgentConversationClient(
  conversationId: string,
  fetchImpl: FetchLike = fetch,
): Promise<AgentConversationDetailResult> {
  try {
    const response = await fetchImpl(`${ENDPOINT}/${encodeURIComponent(conversationId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    if (!response.ok) return DETAIL_FALLBACK;
    return (await response.json()) as AgentConversationDetailResult;
  } catch {
    return DETAIL_FALLBACK;
  }
}

export async function appendAgentConversationMessage(
  conversationId: string,
  message: AgentMessagePayload,
  fetchImpl: FetchLike = fetch,
): Promise<AgentMessageResult> {
  try {
    const response = await fetchImpl(
      `${ENDPOINT}/${encodeURIComponent(conversationId)}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      },
    );
    if (!response.ok) return MESSAGE_FALLBACK;
    return (await response.json()) as AgentMessageResult;
  } catch {
    return MESSAGE_FALLBACK;
  }
}

export async function markAgentProposalReviewedClient(
  conversationId: string,
  proposalId: string,
  fetchImpl: FetchLike = fetch,
): Promise<AgentProposalResult> {
  try {
    const response = await fetchImpl(
      `${ENDPOINT}/${encodeURIComponent(conversationId)}/proposals/${encodeURIComponent(proposalId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "reviewed" }),
      },
    );
    if (!response.ok) return PROPOSAL_FALLBACK;
    return (await response.json()) as AgentProposalResult;
  } catch {
    return PROPOSAL_FALLBACK;
  }
}
