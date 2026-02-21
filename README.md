# Link Tracker

> Share links. Track every click.

A lightweight, self-hosted link tracker. Paste any URL, get a trackable link, and see exactly how many times it's been clicked — no account needed.

**Live:** [link-tracker.doodler.dev](https://link-tracker.doodler.dev)

---

## What it does

Paste a long URL → get a short trackable link → share it anywhere → see how many clicks it gets.

Your link is shown **once** right after creation. Copy it and save it — it won't be listed again. This keeps everyone's links private without needing a login.

---

## Features

- 🔗 **Trackable links** — every click is recorded
- 👁 **Click stats** — paste your link anytime to check the count
- 🔒 **One-time display** — your link is shown once; no public list
- ⚡ **No account needed** — just paste and go
- 🛡 **Rate limited** — 20 links per IP per 15 minutes (Redis-backed)
- 🌐 **Self-hostable** — Docker Compose, runs anywhere

---

## Use cases

- Share a link in a newsletter or post and track engagement
- A/B test which version of a link gets more clicks
- Send a link to someone and see if they actually opened it
- Track traffic from different channels (use a separate link per channel)

---

## How to use

**Create a tracked link:**
1. Go to [link-tracker.doodler.dev](https://link-tracker.doodler.dev)
2. Paste any URL into the box
3. Click **Track →**
4. Copy your link — **save it now**, it won't be shown again

**Check click stats:**
1. Paste your tracked link (or just the 6-character code) into the stats box
2. Click **Check →**
3. See the total click count and original URL

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Backend | Express 5 (Node.js) |
| Database | PostgreSQL 17 |
| Cache / Rate limit | Redis 7 |
| Reverse proxy | Traefik v3 |
| Containerisation | Docker Compose |

---

## Self-hosting

**Requirements:** Docker, Docker Compose, a domain pointed at your server

```bash
git clone https://github.com/lico-happy/link-tracker.git
cd link-tracker
cp .env.example .env   # fill in your values
docker compose up -d
```

**.env values:**

```env
POSTGRES_USER=linktracker
POSTGRES_PASSWORD=your_password
POSTGRES_DB=linktracker
BASE_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

If you're using Traefik, update the `Host(...)` labels in `docker-compose.yml` with your domain.
Without Traefik, remove the labels and map ports directly.

---

## License

MIT — see [LICENSE](./LICENSE)
