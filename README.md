# Instant Mechanic - Live Operations Dashboard

A full-stack vehicle service operations dashboard built with React, Redux Toolkit, Tailwind CSS, Node.js, Express, MongoDB, JWT cookies and Socket.IO.

## Features
- Admin login with HTTP-only JWT cookie
- Dashboard KPIs with month-over-month trend indicators
- Booking/revenue/status/service analytics + a live recent-activity feed
- Search, advanced filters (status, service, mechanic, date range), sorting and pagination
- CSV export of the current filtered booking set
- Booking details and status updates, with a confirmation step before cancelling
- Mechanics list + individual mechanic detail pages
- Live mechanic location map (Leaflet + OpenStreetMap)
- Customers page
- Real-time notification center (bell + dropdown) fed by Socket.IO
- Dark mode, persisted per-browser
- Responsive mobile navigation (slide-out drawer), loading skeletons, empty states, hover/transition micro-interactions
- MongoDB seed data: 600 bookings, 60 customers, 25 mechanics

## Stack
Frontend: React + Vite, Redux Toolkit, React Router, Axios, Tailwind CSS, Recharts, React-Leaflet, Lucide React, React Hot Toast.
Backend: Node.js, Express, Mongoose, JWT, bcryptjs, cookie-parser, CORS, express-rate-limit, Socket.IO.

## Local setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

> Note: this pass added `leaflet` and `react-leaflet` as new frontend dependencies (for the Live Map page). Run `npm install` after pulling this update even if you already had `node_modules` installed.

Default seed login:
- Email: admin@instantmechanic.com
- Password: Admin@12345

## Environment variables

Backend:
MONGO_URI, JWT_SECRET, PORT, FRONTEND_URL, NODE_ENV

Frontend:
VITE_API_URL, VITE_SOCKET_URL

## Architecture
React/Vite -> Axios/Socket.IO -> Express REST API -> Mongoose -> MongoDB Atlas

## API
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
GET /api/dashboard
GET /api/bookings
GET /api/bookings?export=true (uncapped result set for CSV export)
GET /api/bookings/filters/meta (distinct service categories, for the filter panel)
GET /api/bookings/:id
PATCH /api/bookings/:id/status
GET /api/mechanics
GET /api/mechanics/:id
PATCH /api/mechanics/:id/status
GET /api/customers
GET /api/customers/:id
GET /api/health

## What changed in this redesign pass
- **Mobile navigation** — the sidebar previously vanished with no replacement below `lg`; it's now a proper slide-out drawer with overlay.
- **Dark mode** — a `ThemeProvider` persists the choice in `localStorage` and toggles a `dark` class on `<html>`; every page and component has dark variants.
- **Notifications** — a shared Socket.IO connection (`useSocket.js`) feeds a bell/badge/dropdown notification center in the header, in addition to the existing toast-on-update behavior.
- **CSV export** — `Bookings` page can export the current filtered result set (uses a dedicated `export=true` query mode on the backend to bypass the normal 50-row page cap).
- **Advanced filters** — service category, assigned mechanic, and date range, on top of the existing status/search/sort.
- **Mechanic detail page** — `/mechanics/:id`, using the mechanic-by-id endpoint that already existed on the backend.
- **Live mechanic map** — `/map`, Leaflet + OpenStreetMap tiles, color-coded markers by mechanic status.
- **Dashboard** — KPI trend arrows (revenue vs last month, bookings vs last week), a recolored chart set, and a "Recent activity" feed panel.
- **Polish** — skeleton loaders replacing plain "Loading..." text, richer empty states, a confirmation modal before cancelling a booking, and hover/transition micro-interactions on cards and buttons.
- Explicitly **out of scope** for this pass: Docker, Swagger/OpenAPI, CI/CD.

## AI Usage
AI tools may be used for scaffolding, debugging, UI ideas, seed-data generation and documentation. Review and understand all generated code before submission.
