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

## TODO:
- It Opens a DB connection per request; would add connection pooling to scale.
- Reads hit the database directly; a Redis cache on the redirect path would handle
  high read volume.
- Analytics writes are per-click; batching via a queue would suit very high traffic.
