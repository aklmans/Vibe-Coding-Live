import type { OverlayState } from "../types";
import { normalizeStackItems, stackItemsToLabels } from "./stack";
import { isBottomBarKind } from "./bottomBar";
import type { BottomBarSlot } from "./bottomBar";
import type { Locale } from "./i18n";

export type LiveSessionStatus = "draft" | "live" | "ended";

export interface LiveSessionSummary {
  id: string;
  dateKey: string;
  locale: Locale;
  title: string;
  status: LiveSessionStatus;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LiveTaskData {
  text: string;
  done: boolean;
}

export interface LiveSectionData {
  title: string;
  tasks: LiveTaskData[];
}

export interface LiveDataSnapshot {
  session: LiveSessionSummary;
  activeSection: number;
  sections: LiveSectionData[];
  bottomBar: {
    visible: boolean;
    segments: OverlayState["bottomBar"]["segments"];
  };
  stackItems: string[];
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function isLocale(value: unknown): value is Locale {
  return value === "zh" || value === "en";
}

function isStatus(value: unknown): value is LiveSessionStatus {
  return value === "draft" || value === "live" || value === "ended";
}

function isBottomBarSlot(value: unknown): value is BottomBarSlot {
  const source = record(value);
  if (!source || !isBottomBarKind(source.kind)) return false;

  switch (source.kind) {
    case "live":
    case "stack":
    case "topic":
      return true;
    case "progress":
      return typeof source.sectionIndex === "number";
    case "text":
      return typeof source.title === "string" && typeof source.text === "string";
  }
}

export function isLiveDataSnapshot(value: unknown): value is LiveDataSnapshot {
  const source = record(value);
  const session = record(source?.session);
  const bottomBar = record(source?.bottomBar);

  return Boolean(
    source &&
      session &&
      typeof session.id === "string" &&
      typeof session.dateKey === "string" &&
      isLocale(session.locale) &&
      typeof session.title === "string" &&
      isStatus(session.status) &&
      typeof session.startedAt === "string" &&
      (typeof session.endedAt === "string" || session.endedAt === null) &&
      typeof session.createdAt === "string" &&
      typeof session.updatedAt === "string" &&
      typeof source.activeSection === "number" &&
      Array.isArray(source.sections) &&
      source.sections.every((section) => {
        const sectionSource = record(section);
        return (
          sectionSource &&
          typeof sectionSource.title === "string" &&
          Array.isArray(sectionSource.tasks) &&
          sectionSource.tasks.every((task) => {
            const taskSource = record(task);
            return (
              taskSource &&
              typeof taskSource.text === "string" &&
              typeof taskSource.done === "boolean"
            );
          })
        );
      }) &&
      bottomBar &&
      typeof bottomBar.visible === "boolean" &&
      Array.isArray(bottomBar.segments) &&
      bottomBar.segments.every(isBottomBarSlot) &&
      Array.isArray(source.stackItems) &&
      source.stackItems.every((item) => typeof item === "string"),
  );
}

export function overlayStateToLiveData(
  state: OverlayState,
  session: LiveSessionSummary,
): LiveDataSnapshot {
  return {
    session,
    activeSection: state.sidebar.activeSection,
    sections: state.sidebar.sections.map((section, sectionIndex) => ({
      title: section.title,
      tasks: section.bullets.map((text, taskIndex) => ({
        text,
        done: state.sidebar.sectionsDone[sectionIndex]?.[taskIndex] ?? false,
      })),
    })),
    bottomBar: {
      visible: state.bottomBar.visible,
      segments: state.bottomBar.segments.map((segment) => ({ ...segment })),
    },
    stackItems: stackItemsToLabels(state.stack.items),
  };
}

export function applyLiveDataToOverlayState(
  state: OverlayState,
  liveData: LiveDataSnapshot,
): OverlayState {
  return {
    ...state,
    sidebar: {
      ...state.sidebar,
      activeSection: liveData.activeSection,
      sections: liveData.sections.map((section) => ({
        title: section.title,
        bullets: section.tasks.map((task) => task.text),
      })),
      sectionsDone: liveData.sections.map((section) =>
        section.tasks.map((task) => task.done),
      ),
    },
    bottomBar: {
      ...state.bottomBar,
      visible: liveData.bottomBar.visible,
      segments: liveData.bottomBar.segments.map((segment) => ({ ...segment })),
    },
    liveSession: {
      ...state.liveSession,
      startedAt: liveData.session.startedAt,
    },
    stack: {
      ...state.stack,
      items: normalizeStackItems(liveData.stackItems, state.stack.items),
    },
  };
}
