# Twitch Giveaway Wheel

Production-ready Twitch giveaway app for streamers with:

- Twitch OAuth login
- Twitch EventSub WebSocket chat ingestion
- real-time entrant syncing over backend WebSockets
- role-based weighted giveaways
- moderator chat controls
- dashboard + OBS overlay
- Fastify + Prisma + SQLite backend
- React + Vite + Tailwind frontend

## Tech Stack

- Node.js 22
- React + Vite + TypeScript
- Tailwind CSS
- Fastify + TypeScript
- Prisma ORM
- SQLite for local development
- Twitch Helix API + EventSub WebSockets

## Project Structure

```text
/
  backend/
  frontend/
  .env.example
  package.json
  README.md
```

## Prerequisites

- Windows 10 or 11
- Node.js 22.x
- npm 10+
- A Twitch account for the broadcaster
- A Twitch Developer application

## Twitch Developer App Setup

1. Go to the Twitch Developer Console:
   `https://dev.twitch.tv/console/apps`
2. Click **Register Your Application**.
3. Set the app name.
4. Set **OAuth Redirect URL** to:
   `http://localhost:4000/api/auth/callback`
5. Choose an application category like **Website Integration**.
6. Create the app.
7. Open the app’s **Manage** page.
8. Copy the **Client ID**.
9. Generate and copy the **Client Secret**.

Twitch’s docs state that the redirect URL must exactly match the callback URL you use, and that authorization-code flow apps require a client secret.

## Environment Variables

Copy the example file and fill in your values:

```powershell
Copy-Item .env.example .env
```

Required variables:

- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `TWITCH_REDIRECT_URI`
- `SESSION_SECRET`
- `DATABASE_URL`
- `FRONTEND_URL`
- `BACKEND_URL`
- `VITE_API_BASE_URL`

Recommended local values:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="file:./prisma/dev.db"
TWITCH_REDIRECT_URI=http://localhost:4000/api/auth/callback
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:4000
VITE_API_BASE_URL=http://localhost:4000
COOKIE_SECURE=false
```

## Install

Run from the repo root:

```powershell
npm install
```

## Prisma Setup

Generate the Prisma client:

```powershell
npm run prisma:generate
```

Create the local SQLite database and run the first migration:

```powershell
npm run prisma:migrate -- --name init
```

Open Prisma Studio if you want to inspect local data:

```powershell
npm run prisma:studio
```

## Run Locally

Start both backend and frontend:

```powershell
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`

## Production Build

```powershell
npm run build
```

To start the built backend plus a Vite preview of the frontend:

```powershell
npm run start
```

## Local Giveaway Flow Test

1. Start the app with `npm run dev`.
2. Open `http://localhost:5173`.
3. Click **Login with Twitch**.
4. Authorize the app in Twitch.
5. After redirect, verify the dashboard shows your channel info and Twitch connection status.
6. Open or configure the current giveaway.
7. In your Twitch chat, type the entry command, default `!join`.
8. From the dashboard or as a mod in chat, use:
   - `!gopen`
   - `!gclose`
   - `!gspin`
   - `!greroll`
   - `!gclear`
   - `!gstatus`
9. Open the overlay URL shown in the dashboard in a browser or OBS browser source.
10. Spin the wheel and confirm the overlay animates and the winner is recorded in history.

## Troubleshooting

### Login redirects back with an error

- Confirm `TWITCH_REDIRECT_URI` exactly matches the Twitch developer app redirect URL.
- Confirm `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` are correct.

### Dashboard shows disconnected Twitch status

- Make sure you granted all requested scopes during login.
- Log out and log back in after changing scopes.
- Check backend logs for EventSub connection or subscription errors.

### Cookies are not sticking on localhost

- Keep `FRONTEND_URL` and `BACKEND_URL` on `http://localhost`.
- Use `COOKIE_SECURE=false` locally.

### Prisma client errors

- Run `npm run prisma:generate`.
- Re-run `npm run prisma:migrate -- --name init` if the database was deleted.

### Overlay opens but does not animate

- Confirm the overlay URL uses the latest session key from the dashboard.
- Confirm the backend websocket endpoint is reachable from the browser source.

## Twitch API Notes

This project uses official Twitch API patterns:

- OAuth Authorization Code flow for broadcaster login
- user access token refresh flow
- Helix API for user, chat, chatter, follower, moderator, VIP, and subscription data
- EventSub WebSocket transport for `channel.chat.message`

According to current Twitch docs:

- WebSocket EventSub subscriptions must be created with a user access token.
- `channel.chat.message` requires `user:read:chat`.
- sending chat messages requires `user:write:chat`.
- channel follower lookups require `moderator:read:followers`.
- chatter import requires `moderator:read:chatters`.
- moderator lookup requires `moderation:read`.
- VIP lookup requires `channel:read:vips`.
- subscription lookup requires `channel:read:subscriptions`.

## What’s Implemented

- Full Fastify backend with Twitch auth, secure token storage, giveaway logic, rate limiting, and WebSocket updates
- Prisma schema with all required core models
- React dashboard with login, live giveaway management, settings, history, and OBS overlay
- Weighted wheel animation with countdown, winner celebration, and live sync
- CSV export, chatter import, blacklist support, minimum account age checks, and moderator chat commands
