# BitURL - URL Shortener with Analytics

Shorten long URLs into compact links and track clicks on each one.

## Features
- Generate short links from any URL
- Redirect short codes to their original destination
- Per-link click analytics (total clicks + recent activity with referrer and user agent)

## Architecture
 <img width="856" height="664" alt="Untitled Diagram drawio" src="https://github.com/user-attachments/assets/7c84b21b-72f9-48c1-8e7b-834923c0c08d" />

## Tech Stack
- **Backend:** FastAPI (Python), MySQL (Aiven), raw SQL via mysql-connector
- **Frontend:** React (Vite), Tailwind CSS
- **Deployment:** Render (backend), Vercel (frontend)
