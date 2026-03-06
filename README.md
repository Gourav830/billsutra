# BillSutra

BillSutra is a full-stack billing app for invoices, customers, payments, and inventory. The repo contains a Next.js frontend and an Express + Prisma backend.

## Structure

- front-end/ - Next.js app (App Router)
- sever/ - Express + TypeScript API with Prisma

## Requirements

- Node.js 18+ (20 recommended)
- Postgres database

## Quick Start

### 1) Backend

```bash
cd sever
npm install
```

Set environment variables in sever/.env:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
JWT_SECRET="your-jwt-secret"
```

Run migrations and start the API:

```bash
npx prisma migrate dev
npm run dev
```

The API listens on http://localhost:7000 by default.

### 2) Frontend

```bash
cd front-end
npm install
```

Set environment variables in front-end/.env.local:

```
NEXT_PUBLIC_BACKEND_URL="http://localhost:7000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Start the Next.js dev server:

```bash
npm run dev
```

App runs at http://localhost:3000.

## Scripts

Frontend (front-end/):

- npm run dev
- npm run build
- npm run start

Backend (sever/):

- npm run dev
- npm run build
- npm run start

## Notes

- Credentials login uses /api/auth/logincheck on the backend.
- Google sign-in uses NextAuth and calls /api/auth/login for OAuth user upsert.
