export const MAIN_SITE_URL = "https://aklman.com";
export const GITHUB_URL = "https://github.com/aklmans/Vibe-Coding-Live";
export const GITHUB_PROFILE_URL = "https://github.com/aklmans";
export const X_URL = "https://x.com/aklman2018";
export const RSS_URL = "https://aklman.com/rss.xml";

export const appNav = [
  { label: "Product", href: "#product" },
  { label: "Surfaces", href: "#surfaces" },
  { label: "Workflow", href: "#workflow" },
  { label: "Studio", href: "/studio" },
  { label: "GitHub", href: GITHUB_URL },
];

export const mobileNav = [
  { label: "Product", href: "#product" },
  { label: "Surfaces", href: "#surfaces" },
  { label: "Workflow", href: "#workflow" },
  { label: "Try demo", href: "/demo" },
  { label: "Studio", href: "/studio" },
  { label: "GitHub", href: GITHUB_URL },
  { label: "Main site", href: MAIN_SITE_URL },
];

export const featureItems = [
  {
    title: "Live Overlay Builder",
    copy: "Design a transparent main-screen frame, camera slot, sidebar and bottom bar without rebuilding surfaces by hand.",
  },
  {
    title: "Session Config Agent",
    copy: "Ask the agent for a session plan. Review the proposed config in a JSON drawer. Apply it only when you are ready.",
  },
  {
    title: "OBS-ready browser sources",
    copy: "Keep overlay, sidebar and bottom bar as clean browser sources while OBS owns the actual screen capture below.",
  },
];

export const workflowItems = [
  {
    title: "Describe the session",
    copy: "Write a short brief or ask the agent to draft one. The agent proposes a config; nothing is applied yet.",
  },
  {
    title: "Review the config",
    copy: "Open the proposal in the JSON review drawer. Inspect the diff, then Apply — or discard. You stay in control.",
  },
  {
    title: "Connect OBS sources",
    copy: "Add overlay, sidebar and bottom bar as browser sources. OBS or Livehime keeps the real screen capture underneath.",
  },
  {
    title: "Export the kit",
    copy: "Export cover, poster, sidebar, bottom bar and wallpapers. Run Export All for the whole package from one state.",
  },
];

export const agentFlow = [
  {
    step: "01",
    title: "Agent drafts a session config",
    copy: "Describe the stream. The agent returns a proposed config — title, sections, stack, socials — as JSON you can read.",
  },
  {
    step: "02",
    title: "Human reviews and applies",
    copy: "The proposal opens in the JSON review drawer. Inspect the field-level diff, then Apply. Nothing is auto-applied.",
  },
  {
    step: "03",
    title: "OBS renders browser sources",
    copy: "The overlay, sidebar and bottom bar render as clean browser sources. OBS owns the real capture below the frame.",
  },
];

export const agentSafety = [
  "AI output is never auto-applied. A returned config opens in the JSON review drawer, exactly like Import.",
  "The API key stays on the server. It never enters the client bundle, localStorage, or logs.",
];

export type SurfaceKind = "wide" | "tall" | "strip";

export interface SurfaceCard {
  id: string;
  kind: SurfaceKind;
  title: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  summary: string;
  points: string[];
}

export const surfaceCards: ReadonlyArray<SurfaceCard> = [
  {
    id: "cover",
    kind: "wide",
    title: "Cover",
    src: "/product/vibe-coding-cover.png",
    alt: "Vibe Coding Live cover export",
    width: 1280,
    height: 720,
    summary: "Open the stream with an editorial title card that already matches the overlay language.",
    points: ["Serif headline and host profile", "Warm dark / light theme aware", "Export-ready social preview"],
  },
  {
    id: "poster",
    kind: "wide",
    title: "Poster",
    src: "/product/vibe-coding-poster.png",
    alt: "Vibe Coding Live poster export",
    width: 1920,
    height: 1080,
    summary: "Generate a compact promotional poster from the same session configuration.",
    points: ["Session topic and agenda", "Reusable host identity", "Clean social sharing asset"],
  },
  {
    id: "sidebar",
    kind: "tall",
    title: "Sidebar",
    src: "/product/vibe-coding-sidebar.png",
    alt: "Vibe Coding Live sidebar export",
    width: 470,
    height: 760,
    summary: "Keep the live sidebar readable as a separate OBS browser source.",
    points: ["Current focus and section progress", "Quiet social metadata", "Transparent source friendly"],
  },
  {
    id: "bottom-bar",
    kind: "strip",
    title: "Bottom bar",
    src: "/product/vibe-coding-bottom-bar.png",
    alt: "Vibe Coding Live bottom bar export",
    width: 1856,
    height: 180,
    summary: "Use a broadcast metadata strip for timer, progress and stack details.",
    points: ["Low-profile status signals", "Stack chips and session metadata", "Consistent export slice"],
  },
];

export const faqItems = [
  {
    question: "Is the public demo connected to my private stream?",
    answer: "No. Demo mode uses local browser storage and avoids real provider calls, database writes and OBS live-state publishing.",
  },
  {
    question: "Does the AI agent ever auto-apply changes?",
    answer:
      "No. Returned configs open in the JSON review drawer. You apply them manually. The agent never writes directly to OBS, localStorage, the database, or runtime state.",
  },
  {
    question: "Can I still use this as a private studio?",
    answer: "Yes. Open /studio for the full workspace that can connect to server-side AI, database persistence and OBS automation.",
  },
  {
    question: "Where is the real screen capture?",
    answer: "The overlay owns the UI frame. OBS or Livehime owns the real screen/video capture underneath, so layout stays flexible.",
  },
  {
    question: "Can I export the whole broadcast kit?",
    answer: "Yes. The app exports overlay, cover, poster, wallpaper set, sidebar and bottom bar assets from the same state.",
  },
];
