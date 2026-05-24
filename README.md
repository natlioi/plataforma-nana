# Plataforma Nana

English coaching platform for individual students — built by Natália Lioi.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

## Stack

- **Frontend**: React 19 + Vite (no routing library — state-driven SPA)
- **Database**: Supabase (Postgres + RLS)
- **PDF viewer**: pdfjs-dist (lazy-loaded)
- **Deploy**: Vercel (auto-deploy from `main`)

## Project structure

```
src/
├── main.jsx               # Entry point
├── app.jsx                # Root router (Login → Admin | Student)
├── config/
│   └── supabase.js        # Supabase client
├── store/
│   ├── index.js           # State management + Supabase sync
│   └── seed.js            # Dev seed data
├── components/
│   └── chrome.jsx         # Sidebar, RightRail, Icon, Avatar
├── screens/
│   ├── login.jsx          # Demo profile picker
│   ├── homework-runner.jsx
│   ├── student/           # Student-facing screens
│   └── admin/             # Admin panel screens
└── styles/
    ├── tokens.css         # Design tokens
    └── global.css         # Base styles + animations
```

## Environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production — auto-deploys to Vercel |
| `dev` | Integration — preview URLs on Vercel |
| `feature/*` | Individual features |

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
