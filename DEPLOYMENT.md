# Full-Stack Deployment Guide & Troubleshooting

This document outlines the entire process of deploying the A.E-WEBSITE application from a local environment to the live internet. 

## Architectural Overview
- **Frontend**: Hosted on [Vercel](https://vercel.com) (React + Vite) — Chosen for its incredibly fast global CDN and zero-config React hosting.
- **Backend**: Hosted on [Render](https://render.com) (Node.js + Express) — Chosen for its strong Node.js support and seamless database integration.
- **Database**: Hosted on [Render](https://render.com) (PostgreSQL) — Provides a fast, secure, internal connection to the Render Backend.

---

## Part 1: Setting up the Live Database (Render)
1. Created a new **PostgreSQL** instance on Render named `ae-website-db`.
2. Provisioned on the Free tier.
3. Render provided two critical URLs:
   - **Internal Database URL**: Extremely fast and secure; used for the Render backend connecting to the Render DB.
   - **External Database URL**: Used for securely managing the database from an outside computer (like our local laptop).

## Part 2: Deploying the Node.js Backend (Render)
1. Created a new **Web Service** on Render, connected to the forked GitHub repository.
2. Set the Root Directory to `backend` and environment to `Node`.
3. Set the following required Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `DATABASE_URL` (Internal Render URL)
   - `APP_BASE_URL=https://ae-website-backend.onrender.com` ← **required for Google OAuth callback**
   - `CLIENT_BASE_URL=https://a-e-website.vercel.app` ← **required for post-OAuth redirect to frontend**
   - `CORS_ORIGIN=https://a-e-website.vercel.app`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - 4 Auth Secrets: `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `EMAIL_VERIFICATION_TOKEN_SECRET`, `PASSWORD_RESET_TOKEN_SECRET`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` ← **required for Google OAuth**

**⚠️ Challenge 1: TypeScript Build Failure**
*   **The Problem:** Rendering failed during `tsc` because `npm install` skips installing `devDependencies` (like `@types/cors` and `@types/multer`) when `NODE_ENV=production` is set.
*   **The Solution:** We manually instructed Render to install dev dependencies during the build step by adding `--include=dev` to the command:
    ```bash
    npm install --include=dev && npm run prisma:generate && npm run build
    ```

## Part 3: Deploying the Vite Frontend (Vercel)
1. Created a new project in Vercel and connected the GitHub fork.
2. Edited the **Root Directory** to point to the `frontend` folder.
3. Added the production environment variable:
   - `VITE_API_URL = https://ae-website-backend.onrender.com/api`

**⚠️ Challenge 2: Strict Vercel Build Checks**
*   **The Problem:** Vercel automatically runs a very strict production build (`tsc -b`). It detected two unused variables (`Eye` and `containerVariants`) in the UI components and intentionally crashed the build to enforce code quality.
*   **The Solution:** We removed the unused variables directly in the codebase on the laptop, committed the changes, and pushed them to GitHub. Vercel automatically detected the push, rebuilt, and passed successfully.

## Part 4: Establishing Security and Database Tables
Once both services were live, we had to connect them securely.

1. **CORS Origins**: We went back to the Render backend and added `CORS_ORIGIN` with the new `https://a-e-website.vercel.app` URL to allow the frontend to safely speak to the backend.

**⚠️ Challenge 3: Live Registration 500 Error**
*   **The Problem:** When we tested signing up on the live phone website, it threw a "something went wrong" error. We realized that while the database *existed* on Render, it was completely empty. It had no tables (like `User`), so data couldn't be saved!
*   **The Solution:** We updated the Render Build Command to include `npm run db:push` so that Prisma structurally creates all the tables in the live database during deployment:
    ```bash
    npm install --include=dev && npm run prisma:generate && npm run db:push && npm run build
    ```

## Part 5: Creating the First Super Admin
Because the app restricts open Admin signup, our first account defaulted to the role of `STUDENT`. We needed to elevate the role securely.

**⚠️ Challenge 4: Accessing the Live Database**
*   **The Problem:** We wanted to use Prisma Studio locally on the laptop to change the role, so we pasted the Render **External Database URL** into our local `.env` and ran `npx prisma studio`. It failed with a connection error.
*   **The Solution:** Render (like most cloud platforms) requires a secure SSL connection from external sources. We resolved this by appending `?sslmode=require` to the very end of the URL.
    ```env
    DATABASE_URL="postgresql://...render.com/ae_website_db?sslmode=require"
    ```

Once Prisma Studio successfully connected to the live database, we:
1. Navigated to the `User` table.
2. Altered the account's role from `STUDENT` to `SUPER_ADMIN`.
3. Saved the change.
4. Immediately switched the laptop's `.env` back to the `#DATABASE_URL` pointing to the local `pgAdmin` server to ensure local development stayed insulated from production data.

### Mission Accomplished! 🚀
The platform is fully containerized, secure, and live.
