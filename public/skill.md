# Vibe Studio Agent Skill

Read this before preparing, running, configuring, or modifying Vibe Studio.

Product: Vibe Studio / Vibe Coding Live
Repository: https://github.com/aklmans/vibe-studio

## Goal

Vibe Studio is a Next.js live-studio workbench for coding streams. It prepares
editorial broadcast graphics, lets a server-side AI agent draft session config,
renders OBS browser sources, and exports a visual kit.

## First Files To Read

- `AGENTS.md`
- `README.md`
- `src/components/OverlayBuilderApp.tsx`
- `src/components/live-data/`
- `src/lib/live-studio-config.ts`
- `src/lib/session-agent.ts`

## Run Locally

```bash
pnpm install
pnpm dev
```

Open:

- `/demo` for the safe local demo.
- `/studio` for the private full workspace.

Use pnpm only.

## Safe Demo vs Studio

- `/demo` is local-only: no provider calls, no database writes, no OBS side
  effects.
- `/studio` is the private workspace. It can use server-side AI provider env,
  optional database persistence, and OBS automation.

## Agent Boundary

- API key stays on the server in env.
- Never put API keys in browser code, client state, `localStorage`, prompts,
  logs, screenshots, or committed files.
- The client should only see configured/not-configured provider status.
- AI proposals must go through JSON review/apply.
- Do not auto-apply generated config.
- Do not automatically change OBS, DB, runtime state, or localStorage.

## Session Config Boundary

- `live-session.config.json` is the per-session content portable core.
- It may include title, subtitle, author, profile, cover, badges, stack,
  socials, and sections.
- runtime / OBS / localStorage / studio appearance do not belong in v1 config.
- Current section, done states, live timer, OBS state, and app appearance remain
  runtime or studio state.

## OBS Browser Sources

Add these as browser sources when running the app:

```text
/obs/overlay?camera=empty
/obs/overlay?camera=avatar
/obs/sidebar
/obs/bottom-bar
```

The overlay is a transparent UI frame. Place real screen capture, windows, and
camera sources underneath it in OBS or Livehime.

## AI Provider Setup

Use server env only, for example:

```bash
SESSION_AGENT_PROVIDER=deepseek
SESSION_AGENT_BASE_URL=https://api.deepseek.com
SESSION_AGENT_API_KEY=sk-...
SESSION_AGENT_MODEL=deepseek-chat
SESSION_AGENT_USER_AGENT=Vibe-Studio/SessionConfigAgent
```

Do not expose secrets to the client. If no key is configured, use the local
copy-handoff flow.

## Verify

Before handing work back, run:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Also smoke-check `/`, `/demo`, `/studio`, and the OBS routes above.
