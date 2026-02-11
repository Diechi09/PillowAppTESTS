# Pillow

Pillow is a rental matching MVP with Tinder/TikTok-style discovery:
- Two-sided roles: renter and landlord
- Swipe feed for listings and renter applications
- Mutual right swipe creates a match
- Match-based chat inbox
- Map-style discovery with filters and radius search

## Stack
- Next.js (App Router) + TypeScript
- Prisma ORM + SQLite
- Zod validation

## Quick Start
1. Install dependencies.
2. Copy `.env.example` to `.env`.
3. Generate Prisma client and run migration.
4. Seed demo data.
5. Start dev server.

```bash
npm install
copy .env.example .env
npm run prisma:generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000`.

## Demo Flow
1. Go to `/onboarding` and create renter/landlord users.
2. Landlord publishes listings with image/video URLs.
3. Use `/` swipe feed:
- Renter swipes listings
- Landlord swipes interested renters
4. On mutual like, open `/chat` to message.
5. Use `/discover` to filter properties by budget, beds, pets, and radius.

## API Endpoints
- `GET/POST /api/users`
- `GET/POST /api/listings`
- `GET /api/listings/interested`
- `POST /api/swipe`
- `GET /api/matches`
- `GET/POST /api/messages`
- `GET /api/discover`

## Current Scope Notes
- Auth is currently local profile selection (MVP shortcut).
- Media URLs are stored directly; file upload pipeline can be added next.
- Map view is a lightweight prototype surface with coordinate-based pins.


