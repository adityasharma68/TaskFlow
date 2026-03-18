# TaskFlow — Full-Stack Task Management Application

> **React.js · Node.js · Express.js · MySQL · Tailwind CSS · Groq AI · MVC Architecture**

A production-ready, AI-powered task management application with JWT authentication, user-specific task isolation, real-time search, and AI-powered suggestions using Groq AI (Llama 3.1).

🌐 **Live Demo:** https://task-flow-7coz.vercel.app

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Technology Stack](#technology-stack)
3. [Features](#features)
4. [Prerequisites](#prerequisites)
5. [Database Setup](#database-setup)
6. [Backend Setup](#backend-setup)
7. [Frontend Setup](#frontend-setup)
8. [Environment Variables](#environment-variables)
9. [API Reference](#api-reference)
10. [AI Integration](#ai-integration)
11. [Architecture](#architecture)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
TaskFlow/
├── backend/                         ← Node.js / Express API (MVC)
│   ├── config/
│   │   └── db.js                    ← MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js        ← Register, Login, GetMe
│   │   ├── taskController.js        ← CRUD + Search logic
│   │   └── aiController.js          ← Groq AI suggestion logic
│   ├── middleware/
│   │   └── authMiddleware.js        ← JWT verification
│   ├── models/
│   │   ├── userModel.js             ← User SQL queries
│   │   └── taskModel.js             ← Task SQL queries (user-scoped)
│   ├── routes/
│   │   ├── authRoutes.js            ← /api/auth routes
│   │   ├── taskRoutes.js            ← /api/tasks routes
│   │   └── aiRoutes.js              ← /api/ai routes
│   ├── .env.example                 ← Environment variable template
│   ├── package.json
│   └── server.js                    ← Express app entry point
│
└── frontend/                        ← React SPA (Vite + Tailwind CSS)
    ├── src/
    │   ├── components/
    │   │   ├── TaskTable.jsx         ← Task list with AI button
    │   │   ├── TaskForm.jsx          ← Create / Edit form
    │   │   ├── Modal.jsx             ← Reusable overlay dialog
    │   │   ├── SearchBar.jsx         ← Debounced search input
    │   │   ├── StatsBar.jsx          ← Stats dashboard cards
    │   │   └── AISuggestModal.jsx    ← AI suggestion popup
    │   ├── context/
    │   │   └── AuthContext.jsx       ← Global auth state
    │   ├── hooks/
    │   │   └── useTasks.js           ← Custom hook for task state
    │   ├── pages/
    │   │   └── AuthPage.jsx          ← Login / Register page
    │   ├── services/
    │   │   ├── authService.js        ← Auth API calls
    │   │   ├── taskService.js        ← Task API calls
    │   │   └── aiService.js          ← AI API calls
    │   ├── App.jsx                   ← Root component / auth guard
    │   ├── main.jsx                  ← React entry point
    │   └── index.css                 ← Tailwind + custom styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Axios |
| Backend | Node.js 18+, Express 4, express-validator, morgan |
| Database | MySQL 8+, mysql2/promise (connection pool) |
| Authentication | JWT (jsonwebtoken), bcryptjs |
| AI Integration | Groq API (Llama 3.1 8B Instant) |
| Dev Tools | Nodemon, date-fns, react-hot-toast |
| Deployment | Vercel (frontend), Render (backend), Aiven MySQL (database) |

---

## Features

### Core Features
- ✅ **JWT Authentication** — Secure register and login with bcrypt password hashing
- ✅ **User-Specific Tasks** — Every user sees only their own tasks (isolated by user_id)
- ✅ **Full CRUD** — Create, Read, Update, Delete tasks
- ✅ **Live Search** — Debounced search across title and description (400ms delay)
- ✅ **Task Status** — Pending / Completed with visual badges
- ✅ **Overdue Detection** — Past-due tasks highlighted in red automatically
- ✅ **Stats Dashboard** — Total, Completed, Pending, Overdue counts

### AI Features
- 🤖 **AI Task Suggestions** — Click the ✦ AI button on any Pending task
- 🤖 **Step-by-Step Plan** — Claude generates 4-6 actionable steps
- 🤖 **Pro Tips** — Expert advice relevant to the task
- 🤖 **Time Estimate** — Realistic completion time
- 🤖 **Motivational Note** — Encouragement to get started
- 🤖 **Powered by Groq** — Uses Llama 3.1 8B Instant model (free)

### UI Features
- 📱 **Fully Responsive** — Works on mobile, tablet, and desktop
- 🌙 **Dark Theme** — Modern dark UI with teal accent colors
- ✨ **Animations** — Smooth transitions and loading states
- 🔔 **Toast Notifications** — Success and error feedback
- ⚡ **Skeleton Loaders** — Loading states while data fetches

---

## Prerequisites

Make sure the following are installed:

- **Node.js** v18 or higher → [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (bundled with Node.js)
- **MySQL** 8.0 or higher → [mysql.com](https://dev.mysql.com/downloads/)
- A MySQL client: MySQL Workbench, DBeaver, or the CLI
- **Groq API Key** (free) → [console.groq.com](https://console.groq.com)

---

## Database Setup

### 1. Create the database tables

Open MySQL Workbench or any MySQL client and run:

```sql
CREATE TABLE IF NOT EXISTS users (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  avatar_color VARCHAR(20)  NOT NULL DEFAULT '#14b8a6',
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  due_date    DATE,
  status      ENUM('Pending','Completed') NOT NULL DEFAULT 'Pending',
  remarks     TEXT,
  created_by  VARCHAR(100) NOT NULL DEFAULT 'System',
  updated_by  VARCHAR(100) NOT NULL DEFAULT 'System',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE tasks
  ADD CONSTRAINT fk_user_tasks
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;
```

### 2. Database Schema

**users table**

| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED AUTO_INCREMENT | Primary key |
| name | VARCHAR(100) | Display name |
| email | VARCHAR(150) UNIQUE | Login email |
| password | VARCHAR(255) | bcrypt hashed password |
| avatar_color | VARCHAR(20) | Profile avatar colour |
| created_at | TIMESTAMP | Auto-set on insert |
| updated_at | TIMESTAMP | Auto-update on change |

**tasks table**

| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED AUTO_INCREMENT | Primary key |
| user_id | INT UNSIGNED | Foreign key to users |
| title | VARCHAR(255) | Task title (required) |
| description | TEXT | Task details |
| due_date | DATE | Due date |
| status | ENUM | Pending or Completed |
| remarks | TEXT | Additional notes |
| created_by | VARCHAR(100) | Creator name |
| updated_by | VARCHAR(100) | Last editor name |
| created_at | TIMESTAMP | Auto-set on insert |
| updated_at | TIMESTAMP | Auto-update on change |

---

## Backend Setup

### 1. Navigate to backend folder

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see Environment Variables section below).

### 4. Start the backend server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

You should see:
```
✅  MySQL connected successfully
🚀  Server  → http://localhost:5000
🔐  Auth    → http://localhost:5000/api/auth
📋  Tasks   → http://localhost:5000/api/tasks
🤖  AI      → http://localhost:5000/api/ai
```

### 5. Health check

```bash
curl http://localhost:5000/health
# → { "status": "OK", "timestamp": "..." }
```

---

## Frontend Setup

### 1. Navigate to frontend folder

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open your browser at **http://localhost:5173**

The Vite dev server proxies `/api` requests to `http://localhost:5000` automatically — no CORS issues during development.

### 4. Build for production

```bash
npm run build
# Output: frontend/dist/
```

---

## Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Groq AI — get free key at https://console.groq.com
GROQ_API_KEY=gsk_your_groq_api_key

# Frontend URL (for CORS)
FRONTEND_ORIGIN=http://localhost:5173
```

### Frontend (.env.production)

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## API Reference

Base URL: `http://localhost:5000/api`

### Auth Endpoints (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new account |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user (protected) |

### Task Endpoints (Protected — requires JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks for logged-in user |
| GET | `/tasks/search?q=` | Search user's tasks |
| GET | `/tasks/:id` | Get single task |
| POST | `/tasks` | Create new task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

### AI Endpoint (Protected — requires JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/suggest` | Get AI suggestions for a task |

### Request / Response Examples

**POST /auth/register**
```json
{
  "name": "Aditya Sharma",
  "email": "aditya@gmail.com",
  "password": "password123"
}
```

**POST /tasks**
```json
{
  "title": "Build login page",
  "description": "Create login form with React",
  "due_date": "2025-04-15",
  "status": "Pending",
  "remarks": "Use JWT for auth",
  "created_by": "Aditya"
}
```

**POST /ai/suggest**
```json
{
  "title": "Build login page",
  "description": "Create login form with React",
  "due_date": "2025-04-15",
  "status": "Pending"
}
```

**Standard Response Format**
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": { ...taskObject }
}
```

---

## AI Integration

### How It Works

1. User clicks the **✦ AI** button on any Pending task
2. Frontend sends task data to `POST /api/ai/suggest`
3. Backend builds a detailed prompt with task context
4. Groq API (Llama 3.1 8B Instant) generates the response
5. Response is displayed in a beautiful modal popup

### Getting a Free Groq API Key

1. Go to → **https://console.groq.com**
2. Sign up with GitHub or email
3. Click **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_`)
5. Add to your `.env` file as `GROQ_API_KEY`

### AI Response Format

The AI returns a structured response with:
- **Quick Summary** — One sentence about the task
- **Step-by-Step Plan** — 4-6 actionable steps
- **Pro Tips** — 2-3 expert recommendations
- **Time Estimate** — Realistic completion time
- **Motivational Note** — Encouragement to start

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  AuthContext → App → Dashboard → TaskTable           │
│  useTasks (hook) → taskService / aiService (Axios)   │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS + JWT token
┌───────────────────────▼─────────────────────────────┐
│              Express.js Backend (MVC)                │
│  authMiddleware → Routes → Controllers → Models      │
│  + Groq AI API call in aiController                  │
└───────────────────────┬─────────────────────────────┘
                        │ mysql2/promise + SSL
┌───────────────────────▼─────────────────────────────┐
│                  MySQL Database                      │
│           users table + tasks table                  │
│         (tasks.user_id → users.id FK)                │
└─────────────────────────────────────────────────────┘
```

### MVC Pattern

| Layer | File | Responsibility |
|-------|------|---------------|
| Model | `models/taskModel.js` | Raw SQL queries only |
| Controller | `controllers/taskController.js` | Business logic |
| Route | `routes/taskRoutes.js` | URL mapping + validation |
| View | React frontend | User interface |

### Security Features

- Passwords hashed with **bcrypt** (10 salt rounds)
- **JWT tokens** expire after 7 days
- Every task query filtered by **user_id** from JWT
- Input validated with **express-validator**
- Sensitive config in **environment variables** only
- **CORS** configured for frontend origin only

---

## Deployment

### Live URLs

| Service | URL |
|---------|-----|
| 🌐 Frontend | https://task-flow-7coz.vercel.app |
| ⚙️ Backend | https://taskflow-h30o.onrender.com |
| 🗄️ Database | Aiven MySQL (cloud) |

### Deployment Stack

| Part | Platform | Plan |
|------|----------|------|
| Frontend | Vercel | Free |
| Backend | Render | Free |
| Database | Aiven MySQL | Free |
| AI | Groq API | Free |

### Deploy Your Own

1. **Database** — Create free MySQL on [Aiven](https://aiven.io) and run the schema SQL
2. **Backend** — Deploy to [Render](https://render.com), set environment variables, root directory = `backend`
3. **Frontend** — Deploy to [Vercel](https://vercel.com), add `VITE_API_URL` env variable, root directory = `frontend`

---

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `MySQL connection failed` | Wrong DB credentials | Check `.env` DB variables |
| `Access denied` for MySQL | IP blocked by database host | Use Aiven MySQL (no IP blocking) |
| `max_user_connections` | Too many DB connections | Set `connectionLimit: 2` in db.js |
| `secretOrPrivateKey must have a value` | JWT_SECRET missing | Add `JWT_SECRET` to `.env` |
| `Cannot find module 'pg'` | Old PostgreSQL code in db.js | Replace db.js with MySQL version |
| `Route.post() requires callback` | aiController export broken | Check `module.exports = { suggestTask }` |
| `Permission denied` on Vercel build | Wrong build command | Use `vite build` not `npm run build` |
| `CORS error` in browser | FRONTEND_ORIGIN mismatch | Update `FRONTEND_ORIGIN` in Render env |
| `404` on API calls | VITE_API_URL missing | Add env variable in Vercel settings |
| `AI error: quota exceeded` | Free tier exhausted | Switch to Groq API (always free) |

---

## License

MIT License — feel free to use this project for learning and building your own apps.

---

*Built with MVC pattern · React + Node.js + MySQL + Groq AI · Deployed on Vercel + Render + Aiven*