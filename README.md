# Plivo_Assignment Application Documentation

## Overview
A multi-tenant status page system enabling organizations to monitor services and communicate system status. Built with modern web technologies.

Check out the demo video on Loom: [Watch Video](https://www.loom.com/share/4294cfe130d24b80a0f57850e3e78404?sid=ff96948b-7d17-4509-8aac-606056213c63)

## Features
**Core Implementation:**
-  Clerk-powered authentication & team management
-  Organization-based multi-tenancy
- Service CRUD operations with status tracking
-  Incident management with updates
-  Maintenance scheduling
-  Public status pages
-  Responsive UI with TailwindCss

**Stretch Goals Achieved:**
- Public API endpoints
- Real-time status broadcasting

## Tech Stack
**Frontend:**
- React 18 + TypeScript
- Zustand (State management)
- ShadcnUI + Tailwind CSS
- Clerk (Authentication)

**Backend:**
- Express.js + TypeScript
- PostgreSQL + Prisma ORM
- Clerk Webhooks

**DevOps:**
- Render (Backend hosting)
- Vercel (Frontend hosting)

## System Architecture
### Backend Structure

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Clerk account

### Installation
1. Clone repository:
   ```bash
   git clone https://github.com/yourusername/status-page.git
   cd status-page
   ```

2. Install dependencies:
   ```bash
   # Backend
   cd backend && npm install

   # Frontend 
   cd ../frontend && npm install
   ```

3. Configure environment (.env):
   ```ini
   # Backend .env
   DATABASE_URL="postgresql://..."
   CLERK_SECRET_KEY="sk_..."
   FRONTEND_URL="http://localhost:3000"

   # Frontend .env
   REACT_APP_API_URL="http://localhost:5000"
   REACT_APP_CLERK_PUBLISHABLE_KEY="pk_..."
   ```

4. Database setup:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start services:
   ```bash
   # Backend
   npm run dev

   # Frontend
   npm start
   ```

## API Endpoints
| Endpoint          | Method | Description                     |
|-------------------|--------|---------------------------------|
| /api/services     | CRUD    | List all services              |
| /api/incidents    | CRUD   | Create new incident            |
| /api/maintenance  | CRUD    | Update maintenance schedule    |
| /api/public/:org  | GET    | Public status endpoint         |



## Future Roadmap
1.  Email notification system
2.  Uptime metrics dashboard
3.   Status check API endpoints
4.   Comprehensive test suite

##
