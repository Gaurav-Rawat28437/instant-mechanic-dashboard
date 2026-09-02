# Instant Mechanic - Live Operations Dashboard

A full-stack vehicle service operations dashboard built with React, Redux Toolkit, Tailwind CSS, Node.js, Express, MongoDB, JWT cookies and Socket.IO.

## Features
- Admin login with HTTP-only JWT cookie
- Dashboard KPIs
- Booking/revenue/status/service analytics
- Search, status filtering, sorting and pagination
- Booking details and status updates
- Mechanics and customers pages
- Socket.IO real-time booking updates
- MongoDB seed data: 600 bookings, 60 customers, 25 mechanics
- Responsive UI, loading/error/empty states

## Stack
Frontend: React + Vite, Redux Toolkit, React Router, Axios, Tailwind CSS, Recharts, Lucide React, React Hot Toast.
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

Default seed login:
- Email: admin@instantmechanic.com
- Password: Admin@12345

## Environment variables

Backend:
MONGO_URI, JWT_SECRET, PORT, FRONTEND_URL, NODE_ENV

Frontend:
VITE_API_URL

## Architecture
React/Vite -> Axios/Socket.IO -> Express REST API -> Mongoose -> MongoDB Atlas

## API
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
GET /api/dashboard
GET /api/bookings
GET /api/bookings/:id
PATCH /api/bookings/:id/status
GET /api/mechanics
GET /api/mechanics/:id
PATCH /api/mechanics/:id/status
GET /api/customers
GET /api/customers/:id
GET /api/health

## AI Usage
AI tools may be used for scaffolding, debugging, UI ideas, seed-data generation and documentation. Review and understand all generated code before submission.
