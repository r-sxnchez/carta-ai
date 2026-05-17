# Context7 in Carta

Context7 is an MCP server that fetches **current, version-accurate documentation** for the libraries we use, on demand. It plugs into Claude Code and Cursor so the assistant can ground answers in the actual docs for Next.js 16, Supabase, Tailwind v4, shadcn/ui, the OpenAI SDK, and anything else we add later — instead of recalling stale training data.

## Why we use it

Carta is a verification platform. We are not allowed to ship hallucinated APIs or guesswork. Context7 gives the assistant a way to confirm:

- Next.js App Router conventions (route handlers, `multipart/form-data`, streaming, server actions)
- Supabase client + pgvector RPCs
- shadcn/ui component contracts
- Tailwind v4 syntax (which differs from v3)
- OpenAI SDK shape (response formats, streaming, image messages)

That alignment matters most when a small mistake cascades — e.g. a wrong route export breaks the build, a wrong Tailwind class silently does nothing.

## How it works

Context7 runs as a local MCP server via `npx`. When the assistant needs docs, it asks Context7 for the relevant library at the right version. No persistent service, no extra infra.

## Setup

### Claude Code (committed, team-wide)

Already configured. The project ships `.mcp.json` at the repo root:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

When you open the project in Claude Code, you will be prompted once to approve the MCP server. After approval it runs automatically.

**Windows note:** if `npx` is not resolved in your Claude Code environment, replace the command block with:

```json
"command": "cmd",
"args": ["/c", "npx", "-y", "@upstash/context7-mcp"]
```

### Cursor

Create `.cursor/mcp.json` in your home directory (or per project):

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

Then restart Cursor.

## How to use it in prompts

Append `use context7` to any prompt that touches a library API. Examples that fit Carta:

- "Add a `multipart/form-data` route handler in Next.js App Router. use context7"
- "Show the Supabase pgvector RPC pattern with typed responses. use context7"
- "Wire an OpenAI vision message with a base64 image. use context7"
- "Add a shadcn/ui Dialog with an upload area inside. use context7"

You can also ask Context7 directly: "look up the docs for `next/server` route handlers via context7."

## When NOT to use it

- For project-specific logic (e.g. `analyzeClaim` flow) — that lives in this repo, not in external docs.
- For trivial syntax the model already knows cold.
- When you want the model to reason from `AGENTS.md` constraints — those are project rules, not library docs.

## Scope

Context7 is a development-time tool only. It does not run in production, ship in the bundle, or affect users. It only helps engineers and the assistant write correct code.
