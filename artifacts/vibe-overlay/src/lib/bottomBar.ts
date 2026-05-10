// Bottom bar slot types. Each slot picks a "kind" that drives both the editor
// fields shown and the canvas renderer. Keeps the existing 3-segment width
// budget; lets each segment carry structured info instead of free-form text.

export type BottomBarKind =
  | "live"     // elapsed since liveSession.startedAt + start time
  | "progress" // section completion bar from sidebar.sectionsDone[sectionIndex]
  | "stack"    // chip list from state.stack.items
  | "topic"    // mirrors cover.todayTopic so newcomers see what's being built
  | "text";    // freeform title + text (legacy / escape hatch)

export interface LiveSlot {
  kind: "live";
}
export interface ProgressSlot {
  kind: "progress";
  sectionIndex: number;
}
export interface StackSlot {
  kind: "stack";
}
export interface TopicSlot {
  kind: "topic";
}
export interface TextSlot {
  kind: "text";
  title: string;
  text: string;
}

export type BottomBarSlot =
  | LiveSlot
  | ProgressSlot
  | StackSlot
  | TopicSlot
  | TextSlot;

export const BOTTOM_BAR_KIND_VALUES: BottomBarKind[] = [
  "live",
  "progress",
  "stack",
  "topic",
  "text",
];

export const BOTTOM_BAR_KIND_OPTIONS: { value: BottomBarKind; label: string }[] =
  [
    { value: "live", label: "On Air" },
    { value: "progress", label: "Progress" },
    { value: "stack", label: "Stack" },
    { value: "topic", label: "Topic" },
    { value: "text", label: "Text" },
  ];

export function isBottomBarKind(value: unknown): value is BottomBarKind {
  return (
    typeof value === "string" &&
    (BOTTOM_BAR_KIND_VALUES as string[]).includes(value)
  );
}

export function defaultSlotForKind(kind: BottomBarKind): BottomBarSlot {
  switch (kind) {
    case "live":
      return { kind: "live" };
    case "progress":
      return { kind: "progress", sectionIndex: 0 };
    case "stack":
      return { kind: "stack" };
    case "topic":
      return { kind: "topic" };
    case "text":
      return { kind: "text", title: "正在做", text: "AI 工作流直播搭建" };
  }
}

// Format milliseconds as a stream-style clock. <1h shows "M:SS"; >=1h shows
// "H:MM:SS". Negative or zero returns "0:00".
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

// Format the start datetime as a short HH:mm label for the live slot footnote.
export function formatStartLabel(startedAt: string): string {
  if (!startedAt) return "";
  const d = new Date(startedAt);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
