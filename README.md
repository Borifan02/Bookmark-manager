# Bookmark Manager (scaffold)

This workspace contains a simple scaffold for a Bookmark Manager using Node/Express + MongoDB (backend) and Vite + React (frontend).

Quick start (PowerShell):

1. Start MongoDB (local) and ensure it's reachable at `mongodb://localhost:27017`.

2. Install and run the server:

```powershell
cd server
npm install
npm run dev
```

3. Install and run the client:

```powershell
cd client
npm install
npm run dev
```

The client runs on Vite (usually http://localhost:5173) and the server on http://localhost:4000.

What's included:
- Basic MongoDB schema for bookmarks with tags, archived/pinned flags, and metadata fields.
- REST endpoints for listing, creating, updating, and deleting bookmarks.
- Minimal React UI to add and view bookmarks and copy URLs to the clipboard.

Next steps I can take:
- Implement multi-tag filtering, debounced search, archive/pin endpoints, and metadata extraction.
- Add tests and Docker setup.

Deployment to Vercel (monorepo with serverless API)
1. Add project to Vercel and set the following environment variables in the Vercel project settings:
	- `MONGODB_URI` — MongoDB connection string for production (use MongoDB Atlas)
2. The repository contains an `api/` function that wraps the existing Express app for Vercel serverless. Vercel will build the frontend from the `client` folder and deploy the API under `/api`.
3. To preview locally you can:

```powershell
# from repository root
npm --prefix api install
npm --prefix client install

# start the serverless function locally (optional tools like `vercel dev` recommended)
# Install Vercel CLI: npm i -g vercel
# Run: vercel dev
```

Notes:
- Vercel functions install dependencies from `api/package.json` (the function wrapper) — ensure it matches the `server` dependencies when you change server packages.
- Set `VITE_API_BASE` in the Vercel project to `https://<your-deployment>.vercel.app/api` so the frontend talks to the serverless API.

Tailwind CSS notes:
- I added Tailwind + PostCSS and `@tailwindcss/forms`. During development Vite will process Tailwind via PostCSS.
- To generate a production CSS file run from the `client` folder:

```powershell
npm run build:css
```

Dark mode:
- Tailwind dark mode is enabled via the `class` strategy. Add the `dark` class to the `html` element to enable dark styles (e.g., `document.documentElement.classList.add('dark')`).
