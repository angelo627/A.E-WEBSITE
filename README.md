# A.E-WEBSITE

Algorithmic Explorers is a monorepo with:
- `frontend/`: React + Vite + TypeScript
- `backend/`: Express + TypeScript + Prisma + PostgreSQL

This README is a step-by-step deployment guide so you can deploy without missing anything.

## Project Structure

```text
A.E-WEBSITE/
├── frontend/
└── backend/
```

## Recommended Deployment Architecture

Use:
- Backend: Render Web Service
- Database: Render PostgreSQL
- Frontend: Vercel

This is the cleanest setup for this repo structure.

## 1. Local Setup (Optional but Recommended)

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

Backend default URL: `http://localhost:5000`  
Health endpoint: `http://localhost:5000/api/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## 2. Create Render PostgreSQL

1. In Render dashboard, click `New` -> `PostgreSQL`.
2. Create the database.
3. Copy the external connection string after it is ready.
4. This value will be your backend `DATABASE_URL`.

## 3. Deploy Backend to Render

1. In Render dashboard, click `New` -> `Web Service`.
2. Connect this GitHub repo.
3. Configure service:
- Root Directory: `backend`
- Build Command:

```bash
npm ci && npx prisma generate && npm run build && npx prisma migrate deploy
```

- Start Command:

```bash
npm run start
```

- Health Check Path:

```text
/api/health
```

4. Add backend environment variables in Render:

```env
NODE_ENV=production
DATABASE_URL=<render-postgres-external-url>
APP_BASE_URL=https://<your-backend>.onrender.com
CLIENT_BASE_URL=https://<your-frontend-domain>
CORS_ORIGIN=https://<your-frontend-domain>

ACCESS_TOKEN_SECRET=<long-random-secret>
REFRESH_TOKEN_SECRET=<long-random-secret>
EMAIL_VERIFICATION_TOKEN_SECRET=<long-random-secret>
PASSWORD_RESET_TOKEN_SECRET=<long-random-secret>

# optional (if those features are used)
PLUNK_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

5. Deploy backend.
6. Confirm backend is up at:

```text
https://<your-backend>.onrender.com/api/health
```

## 4. Deploy Frontend to Vercel

1. In Vercel dashboard, click `New Project`.
2. Import this GitHub repo.
3. Configure project:
- Root Directory: `frontend`
- Framework preset: `Vite` (usually auto-detected)
- Build command: `npm run build`
- Output directory: `dist`

4. Add environment variable in Vercel:

```env
VITE_API_URL=https://<your-backend>.onrender.com/api
```

5. Deploy frontend.

## 5. Final Backend Env Update After Vercel URL Is Ready

After frontend deploy, copy the Vercel production URL and update backend env on Render:

```env
CLIENT_BASE_URL=https://<your-project>.vercel.app
CORS_ORIGIN=https://<your-project>.vercel.app
```

Redeploy backend after these updates.

## 6. Production Verification Checklist

1. Frontend opens successfully on Vercel URL.
2. Backend health endpoint returns success.
3. Login/register API requests work from frontend.
4. No CORS errors in browser console.
5. Render logs show no Prisma or database connection errors.

## 7. Common Deployment Mistakes

1. Wrong root directory:
- backend must use `backend`
- frontend must use `frontend`

2. Wrong frontend API URL:
- `VITE_API_URL` must include `/api`

3. Missing production secrets:
- token secrets must be set in Render

4. CORS mismatch:
- `CORS_ORIGIN` must exactly match the frontend deployed domain

5. Missing database URL:
- `DATABASE_URL` must be the Render PostgreSQL external URL

## Useful Scripts

### Backend (`backend/`)

- `npm run dev` - start backend in watch mode
- `npm run build` - compile TypeScript
- `npm run start` - run compiled backend
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - run local dev migrations
- `npm run db:push` - push schema changes directly

### Frontend (`frontend/`)

- `npm run dev` - start Vite dev server
- `npm run build` - build frontend for production
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint
