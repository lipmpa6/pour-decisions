# Pour Decisions 🍹
### Track your tabs. Own your chaos.

A lightweight internal tool for tracking drink debts between teammates — because "I owe you a beer" almost never gets paid back.

**Live app →** [pour-decisions-two.vercel.app](https://pour-decisions-two.vercel.app) *(password protected)*

---

## What It Does

Pour Decisions lets coworkers give and request drinks, log the reason why, and tracks who owes what over time.

- **Log a debt** — "Phil owes Sarah 2 Espresso Martinis · Lost the bet"
- **Leaderboard** — ranked view of who owes the most drinks overall
- **Reason tracking** — see which projects or moments have racked up the most tabs
- **Full history** — every debt logged with timestamp, drink type, and reason
- **Custom menu** — add your own drinks and reasons beyond the defaults
- **Multi-person debts** — log to multiple people in one entry
- **Slack notifications** — posts to a team channel when a new debt is logged

10+ colleagues at [Beyond](https://www.beyond.com) actively use this.

---

## Why I Built It

At Beyond, we have a culture of trading small favors — someone scrambles to cover a project, fixes a bug under pressure, or just shows up when it counts. The informal economy runs on "I owe you a drink," but no one ever collects.

I built this to make that real. It started as a side project to learn how to ship a full tool end-to-end — product thinking, design, and deployment — and became something the team actually uses.

---

## Key Product Decisions

**GitHub as the database**
This is an internal tool with a small, trusted user base. Rather than provisioning a full database (Supabase, Postgres), I used a JSON file stored in GitHub as lightweight persistent storage. The Vercel serverless function reads and writes via the GitHub API. This was the right call for the use case — low overhead, no infrastructure to maintain, easy to inspect the raw data.

*Tradeoff: Not suitable for high-traffic or concurrent writes. If this scaled beyond ~20 users, I'd migrate to Supabase.*

**Password over full auth**
A shared app password keeps it simple for an internal tool without requiring user accounts or OAuth. Passwords are stored in localStorage so colleagues don't re-enter every session.

*Tradeoff: Single shared password means no per-user identity. Acceptable for a social, low-stakes tool.*

**Single HTML file**
No build step, no framework, no dependencies to manage. Pure HTML, CSS, and vanilla JavaScript. This made it fast to ship and easy to iterate on without tooling overhead.

*Tradeoff: As features grow, this will become harder to maintain. A component framework would be the next step.*

**Net debt calculation**
The leaderboard shows net balances — if Phil owes Sarah 3 drinks but Sarah owes Phil 1, it shows Phil owes Sarah 2. This keeps the view clean and avoids double-counting favors.

---

## What I Learned

- **Scope constraints force good decisions.** Using GitHub as a database sounds like a hack, but it was the right call for this context. The constraint made me think clearly about tradeoffs rather than over-engineering it.
- **Internal tools ship when they solve real problems.** This got adopted because it fit an actual behavior my team already had — not because I promoted it.
- **Design matters even for internal tools.** I spent real time on the UI (dark theme, drink emojis, leaderboard medals) because people are more likely to use something that feels good. Colleagues noticed.
- **Single-file apps have real limits.** The code works but is already getting long. My next project used a proper framework from the start.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Typography | Google Fonts (Pacifico, DM Sans) |
| Backend | Vercel Serverless Functions |
| Database | GitHub API (JSON file as data store) |
| Hosting | Vercel |
| Auth | Shared password + localStorage |

---

## Local Development
```bash
# Clone the repo
git clone https://github.com/lipmpa6/pour-decisions
cd pour-decisions

# Create a .env.local file with:
# GITHUB_TOKEN=your_github_token
# GITHUB_OWNER=your_github_username
# GITHUB_REPO=pour-decisions
# APP_PASSWORD=your_app_password
# SLACK_WEBHOOK_URL=your_slack_webhook (optional)

# Run locally (requires Vercel CLI)
npx vercel dev
```

---

## About

Built by [Phil Lipman](https://github.com/lipmpa6) — Director of Product Management at Beyond.

Part of a broader project to build technical literacy alongside PM fundamentals. Every project here is meant to be real, useful, and honest about what it is and isn't.
