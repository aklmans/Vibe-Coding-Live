import { and, asc, desc, eq } from "drizzle-orm";
import type { Locale } from "../lib/i18n";
import { getDb, type AppDatabase } from "./client";
import { agentConversations, agentMessages, agentProposals } from "./schema";

type AgentConversationRow = typeof agentConversations.$inferSelect;
type AgentMessageRow = typeof agentMessages.$inferSelect;
type AgentProposalRow = typeof agentProposals.$inferSelect;

export type AgentConversationRole = "user" | "assistant" | "system";
export type AgentMessageKind = "local" | "ai";
export type AgentMessageStatus = "copied" | "manual" | "success" | "error";
export type AgentProposalStatus = "draft" | "reviewed" | "applied" | "discarded";

export interface AgentConversationSummary {
  id: string;
  dateKey: string;
  locale: Locale;
  title: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface AgentConversationProposal {
  id: string;
  configText: string;
  summaryJson: unknown;
  status: AgentProposalStatus;
  appliedAt: string | null;
  createdAt: string;
}

export interface AgentConversationMessage {
  id: string;
  role: AgentConversationRole;
  kind: AgentMessageKind | null;
  status: AgentMessageStatus | null;
  content: string;
  taskId: string;
  taskLabel: string;
  snapshot: string;
  provider: string;
  model: string;
  createdAt: string;
  proposal: AgentConversationProposal | null;
}

export interface AgentConversationDetail extends AgentConversationSummary {
  messages: AgentConversationMessage[];
}

export interface AgentConversationListResult {
  databaseConfigured: boolean;
  conversations: AgentConversationSummary[];
  current: AgentConversationDetail | null;
}

export interface AgentConversationDetailResult {
  databaseConfigured: boolean;
  conversation: AgentConversationDetail | null;
}

export interface AgentMessageResult {
  databaseConfigured: boolean;
  message: AgentConversationMessage | null;
}

export interface AgentProposalResult {
  databaseConfigured: boolean;
  proposal: AgentConversationProposal | null;
}

export interface AgentConversationPatchInput {
  status: "archived";
}

export interface AgentProposalPatchInput {
  status: "reviewed";
}

export interface AgentMessageInput {
  role: AgentConversationRole;
  kind: AgentMessageKind | null;
  status: AgentMessageStatus | null;
  content: string;
  taskId: string;
  taskLabel: string;
  snapshot: string;
  provider: string;
  model: string;
  proposal: {
    configText: string;
    summaryJson: unknown;
    status: "draft";
  } | null;
}

export const AGENT_CONVERSATION_FALLBACK: AgentConversationListResult = {
  databaseConfigured: false,
  conversations: [],
  current: null,
};

export function defaultAgentConversationTitle(dateKey: string): string {
  return `Session Agent · ${dateKey}`;
}

export function deriveAgentConversationTitle(content: string, dateKey: string): string {
  const firstLine = content
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, " "))
    .find(Boolean);
  if (!firstLine) return defaultAgentConversationTitle(dateKey);
  return firstLine.length > 62 ? `${firstLine.slice(0, 61)}…` : firstLine;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validRole(value: unknown): AgentConversationRole | null {
  return value === "user" || value === "assistant" || value === "system"
    ? value
    : null;
}

function validKind(value: unknown): AgentMessageKind | null {
  return value === "local" || value === "ai" ? value : null;
}

function validStatus(value: unknown): AgentMessageStatus | null {
  return value === "copied" ||
    value === "manual" ||
    value === "success" ||
    value === "error"
    ? value
    : null;
}

function normalizeProposal(value: unknown): AgentMessageInput["proposal"] {
  const input = record(value);
  if (!input) return null;
  const configText = text(input.configText);
  if (!configText) return null;
  return {
    configText,
    summaryJson: input.summaryJson ?? null,
    status: "draft",
  };
}

export function normalizeAgentMessageInput(value: unknown): AgentMessageInput | null {
  const input = record(value);
  if (!input) return null;
  const role = validRole(input.role);
  const content = text(input.content);
  if (!role || !content) return null;

  return {
    role,
    kind: validKind(input.kind),
    status: validStatus(input.status),
    content,
    taskId: nullableText(input.taskId),
    taskLabel: nullableText(input.taskLabel),
    snapshot: nullableText(input.snapshot),
    provider: nullableText(input.provider),
    model: nullableText(input.model),
    proposal: normalizeProposal(input.proposal),
  };
}

export function normalizeAgentConversationPatch(value: unknown): AgentConversationPatchInput | null {
  const input = record(value);
  if (!input) return null;
  return input.status === "archived" ? { status: "archived" } : null;
}

export function normalizeAgentProposalPatch(value: unknown): AgentProposalPatchInput | null {
  const input = record(value);
  if (!input) return null;
  return input.status === "reviewed" ? { status: "reviewed" } : null;
}

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function isoOrNull(value: Date | string | null): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function conversationStatus(value: string): "active" | "archived" {
  return value === "archived" ? "archived" : "active";
}

function proposalStatus(value: string): AgentProposalStatus {
  switch (value) {
    case "reviewed":
    case "applied":
    case "discarded":
      return value;
    default:
      return "draft";
  }
}

function rowToSummary(row: AgentConversationRow): AgentConversationSummary {
  return {
    id: row.id,
    dateKey: row.dateKey,
    locale: row.locale === "en" ? "en" : "zh",
    title: row.title,
    status: conversationStatus(row.status),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

function rowToProposal(row: AgentProposalRow): AgentConversationProposal {
  return {
    id: row.id,
    configText: row.configText,
    summaryJson: row.summaryJson ?? null,
    status: proposalStatus(row.status),
    appliedAt: isoOrNull(row.appliedAt),
    createdAt: iso(row.createdAt),
  };
}

function rowToMessage(
  row: AgentMessageRow,
  proposal: AgentConversationProposal | null,
): AgentConversationMessage {
  return {
    id: row.id,
    role: validRole(row.role) ?? "assistant",
    kind: validKind(row.kind),
    status: validStatus(row.status),
    content: row.content,
    taskId: row.taskId ?? "",
    taskLabel: row.taskLabel ?? "",
    snapshot: row.snapshot ?? "",
    provider: row.provider ?? "",
    model: row.model ?? "",
    createdAt: iso(row.createdAt),
    proposal,
  };
}

async function readConversationDetail(
  db: AppDatabase,
  row: AgentConversationRow,
): Promise<AgentConversationDetail> {
  const [messageRows, proposalRows] = await Promise.all([
    db
      .select()
      .from(agentMessages)
      .where(eq(agentMessages.conversationId, row.id))
      .orderBy(asc(agentMessages.createdAt)),
    db
      .select()
      .from(agentProposals)
      .where(eq(agentProposals.conversationId, row.id)),
  ]);
  const proposalsByMessage = new Map(
    proposalRows.map((proposal) => [proposal.messageId, rowToProposal(proposal)]),
  );

  return {
    ...rowToSummary(row),
    messages: messageRows.map((message) =>
      rowToMessage(message, proposalsByMessage.get(message.id) ?? null),
    ),
  };
}

export async function getOrCreateCurrentAgentConversation(
  locale: Locale,
  dateKey: string,
): Promise<AgentConversationListResult> {
  const db = getDb();
  if (!db) return AGENT_CONVERSATION_FALLBACK;

  const conversations = await listAgentConversationRows(db, locale, dateKey);
  const currentRow =
    conversations.find((conversation) => conversation.status !== "archived") ??
    (await createAgentConversationRow(db, locale, dateKey));
  const listRows = conversations.some((conversation) => conversation.id === currentRow.id)
    ? conversations
    : [currentRow, ...conversations];

  return {
    databaseConfigured: true,
    conversations: listRows.map(rowToSummary),
    current: await readConversationDetail(db, currentRow),
  };
}

export async function createAgentConversation(
  locale: Locale,
  dateKey: string,
): Promise<AgentConversationDetailResult> {
  const db = getDb();
  if (!db) return { databaseConfigured: false, conversation: null };
  const row = await createAgentConversationRow(db, locale, dateKey);
  return {
    databaseConfigured: true,
    conversation: await readConversationDetail(db, row),
  };
}

export async function getAgentConversation(
  conversationId: string,
): Promise<AgentConversationDetailResult> {
  const db = getDb();
  if (!db) return { databaseConfigured: false, conversation: null };
  const [row] = await db
    .select()
    .from(agentConversations)
    .where(eq(agentConversations.id, conversationId))
    .limit(1);
  return {
    databaseConfigured: true,
    conversation: row ? await readConversationDetail(db, row) : null,
  };
}

export async function archiveAgentConversation(
  conversationId: string,
): Promise<AgentConversationDetailResult> {
  const db = getDb();
  if (!db) return { databaseConfigured: false, conversation: null };
  const [row] = await db
    .update(agentConversations)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(agentConversations.id, conversationId))
    .returning();
  return {
    databaseConfigured: true,
    conversation: row ? await readConversationDetail(db, row) : null,
  };
}

export async function markAgentProposalReviewed(
  conversationId: string,
  proposalId: string,
): Promise<AgentProposalResult> {
  const db = getDb();
  if (!db) return { databaseConfigured: false, proposal: null };
  const [row] = await db
    .update(agentProposals)
    .set({ status: "reviewed" })
    .where(and(eq(agentProposals.conversationId, conversationId), eq(agentProposals.id, proposalId)))
    .returning();
  return {
    databaseConfigured: true,
    proposal: row ? rowToProposal(row) : null,
  };
}

export async function appendAgentMessage(
  conversationId: string,
  input: AgentMessageInput,
): Promise<AgentMessageResult> {
  const db = getDb();
  if (!db) return { databaseConfigured: false, message: null };

  const [message] = await db
    .insert(agentMessages)
    .values({
      conversationId,
      role: input.role,
      kind: input.kind,
      status: input.status,
      content: input.content,
      taskId: input.taskId || null,
      taskLabel: input.taskLabel || null,
      snapshot: input.snapshot || null,
      provider: input.provider || null,
      model: input.model || null,
      createdAt: new Date(),
    })
    .returning();

  if (!message) return { databaseConfigured: true, message: null };

  let proposal: AgentConversationProposal | null = null;
  if (input.proposal) {
    const [proposalRow] = await db
      .insert(agentProposals)
      .values({
        conversationId,
        messageId: message.id,
        configText: input.proposal.configText,
        summaryJson: input.proposal.summaryJson,
        status: input.proposal.status,
        createdAt: new Date(),
      })
      .returning();
    proposal = proposalRow ? rowToProposal(proposalRow) : null;
  }

  const titleUpdate = await deriveTitleUpdateForMessage(db, conversationId, input);

  await db
    .update(agentConversations)
    .set({ updatedAt: new Date(), ...(titleUpdate ? { title: titleUpdate } : {}) })
    .where(eq(agentConversations.id, conversationId));

  return {
    databaseConfigured: true,
    message: rowToMessage(message, proposal),
  };
}

async function deriveTitleUpdateForMessage(
  db: AppDatabase,
  conversationId: string,
  input: AgentMessageInput,
): Promise<string | null> {
  if (input.role !== "user") return null;
  const [conversation] = await db
    .select({
      dateKey: agentConversations.dateKey,
      title: agentConversations.title,
    })
    .from(agentConversations)
    .where(eq(agentConversations.id, conversationId))
    .limit(1);
  if (!conversation) return null;
  if (conversation.title !== defaultAgentConversationTitle(conversation.dateKey)) return null;
  return deriveAgentConversationTitle(input.content, conversation.dateKey);
}

async function listAgentConversationRows(
  db: AppDatabase,
  locale: Locale,
  dateKey: string,
): Promise<AgentConversationRow[]> {
  return db
    .select()
    .from(agentConversations)
    .where(
      and(
        eq(agentConversations.dateKey, dateKey),
        eq(agentConversations.locale, locale),
        eq(agentConversations.status, "active"),
      ),
    )
    .orderBy(desc(agentConversations.updatedAt))
    .limit(20);
}

async function createAgentConversationRow(
  db: AppDatabase,
  locale: Locale,
  dateKey: string,
): Promise<AgentConversationRow> {
  const now = new Date();
  const [row] = await db
    .insert(agentConversations)
    .values({
      dateKey,
      locale,
      title: defaultAgentConversationTitle(dateKey),
      status: "active",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  if (!row) throw new Error("Failed to create agent conversation");
  return row;
}
