# A.E-WEBSITE

Algorithmic Explorers is a React + TypeScript frontend project built with Vite and Tailwind CSS.

## Project Structure

- `frontend/` - React + TypeScript application
  - `frontend/src/pages/` - page-level screens such as `HomePage`, `GuruCircle`, and `LearningCohort`
  - `frontend/src/components/` - shared UI components such as `Navbar` and `Footer`
  - `frontend/src/index.css` - global styles and Tailwind-related styling
- `backend/` - API server and database services (coming soon)

## Design Reference

Figma file: [ALGORITHMIC EXPLORERS WEBSITE](https://www.figma.com/design/DyTuPXcfnYue1igNIR8TKc/ALGORITHMIC-EXPLORERS-WEBSITE?node-id=0-1)

## How To Run

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Backend

Backend setup instructions will be added once the backend folder is initialized.

## Useful Scripts

Run these commands from inside `frontend/`:

- `npm run dev` - start the local development server
- `npm run build` - type-check and build the app for production
- `npm run lint` - run ESLint across the project
- `npm run preview` - preview the production build locally


## Contributors Guide

Use this section as the working guide for anyone contributing to the project.

### Before You Start

- Read the Figma design before making UI changes so the implementation stays aligned with the intended layout and visual language.
- Work inside the `frontend/` folder unless a task explicitly requires changes at the repository root.
- Keep changes focused on one feature or fix at a time.

### Recommended Workflow

1. Pull the latest changes before starting work.
2. Install dependencies with `npm install` inside `frontend/` if needed.
3. Run the app with `npm run dev` and verify changes in the browser.
4. Use `npm run lint` before opening a pull request.
5. Build with `npm run build` to confirm the app is production-ready.

### Code Style

- Keep page files thin and move reusable UI into components.
- Keep styling consistent with the existing Tailwind setup and theme tokens.
- Prefer clear component and file names that match the feature they serve.
- Avoid mixing layout, business logic, and API code in the same file when it can be separated cleanly.

### Pull Request Checklist

- The change matches the Figma design or the requested behavior.
- The app runs without console errors.
- Lint passes locally.
- Build passes locally.
- Any new reusable UI has been placed in the appropriate `frontend/src/components/` folder.

## Notes

- The app entry flow is `src/main.tsx` -> `src/App.tsx` -> `src/pages/HomePage.tsx`.
- Backend integration is in progress.