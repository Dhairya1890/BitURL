# BitURL - URL Shortener with Analytics

Shorten long URLs into compact links and track clicks on each one.

## Features
- Generate short links from any URL
- Redirect short codes to their original destination
- Per-link click analytics (total clicks + recent activity with referrer and user agent)

## Tech Stack
- **Backend:** FastAPI (Python), MySQL (Aiven), raw SQL via mysql-connector
- **Frontend:** React (Vite), Tailwind CSS
- **Deployment:** Render (backend), Vercel (frontend)

## Engineering Decisions
- **Short codes:** randomly generated base62 (6 chars, ~56B combinations) using
  Python's `secrets` module for unpredictability, rather than sequential IDs which
  would be enumerable.
- **Collision handling:** relies on the database's UNIQUE constraint with
  insert-and-retry, avoiding a check-then-insert race condition.
- **Analytics writes:** recorded via FastAPI BackgroundTasks so the redirect path
  isn't blocked by the click-logging insert.
- **Security:** parameterized queries throughout; secrets and DB credentials kept
  out of source via environment variables and gitignored files.

## Known Limitations / Next Steps
- Opens a DB connection per request; would add connection pooling to scale.
- Reads hit the database directly; a Redis cache on the redirect path would handle
  high read volume.
- Analytics writes are per-click; batching via a queue would suit very high traffic.

## Running Locally
TODO:
[setup steps: env vars, schema, uvicorn, npm run dev]
