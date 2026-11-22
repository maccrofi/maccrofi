# MacCroFi

Fashion reimagined in 3D — a single-page e-commerce app.

## Tech Stack

| Layer        | Tool                              |
| ------------ | --------------------------------- |
| Framework    | Vite + React (JavaScript / JSX)   |
| Routing      | react-router-dom                  |
| Auth & DB    | Firebase Auth + Firestore         |
| Hosting      | Cloudflare Pages                  |
| 3D (later)   | three / @react-three/fiber / drei |
| Assets       | Cloudflare R2 (later)             |

## Folder Structure

```
src/
  components/   → Reusable UI pieces (Navbar, ProtectedRoute, Loader)
  context/      → React contexts (AuthContext)
  firebase/     → Firebase initialisation (config.js)
  pages/        → Route-level components (Home, Login, Signup, …)
  data/         → Static data files (products placeholder)
  App.jsx       → Root component with routes
  main.jsx      → Entry point
  index.css     → Global styles
public/
  _redirects    → Cloudflare Pages SPA rewrite rule
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create your .env from the template
cp .env.example .env
# Then fill in your Firebase project values

# 3. Start the dev server
npm run dev
```

## Environment Variables

All prefixed with `VITE_` so Vite exposes them to client code.

| Variable                            | Description                |
| ----------------------------------- | -------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase Web API key       |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Auth domain                |
| `VITE_FIREBASE_PROJECT_ID`          | Project ID                 |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Storage bucket             |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging sender ID  |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID            |

> **Never commit `.env`** — only `.env.example` is tracked.

## Deployment

Push to `main` on GitHub. Cloudflare Pages auto-builds with:
- Build command: `npm run build`
- Output directory: `dist`
- Node version env var: `NODE_VERSION = 20`
