# Smart Student Academy Management System

A production-ready full-stack academic management platform built with React, Node.js, Express, and MongoDB.

## Features

- **Authentication** — JWT-based login & registration with bcrypt password hashing
- **Dashboard** — Academic overview: day order, timetable, exams, tasks, notifications
- **Timetable** — Day-order based class schedule (DO 1–6), set today's day order
- **Holiday Management** — Mark holidays; they don't consume a day order slot
- **Profile** — Photo upload, academic details (college, register number, dept, semester)
- **Notes** — Upload, search, filter and download PDF study materials
- **Tasks & Assignments** — Priority-based todo list with due dates, overdue tracking
- **Exam Schedule** — Countdown timer for upcoming exams, categorised by type
- **Notifications** — Auto-generated alerts for exams, assignments, holidays and timetable changes

---

## Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm

---

## Project Structure

```
Student-Academy-Management-System/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── profileController.js
│   │   ├── timetableController.js
│   │   ├── holidayController.js
│   │   ├── notesController.js
│   │   ├── todoController.js
│   │   ├── examController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Profile.js
│   │   ├── Timetable.js
│   │   ├── Holiday.js
│   │   ├── DayOrderTracking.js
│   │   ├── Note.js
│   │   ├── Todo.js
│   │   ├── Exam.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── timetableRoutes.js
│   │   ├── holidayRoutes.js
│   │   ├── notesRoutes.js
│   │   ├── todoRoutes.js
│   │   ├── examRoutes.js
│   │   └── notificationRoutes.js
│   ├── uploads/
│   │   ├── profiles/
│   │   └── notes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Navbar.jsx / .css
    │   │   ├── Sidebar.jsx / .css
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── DashboardCard.jsx / .css
    │   │   ├── NotificationCard.jsx / .css
    │   │   └── Loader.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx / Auth.css
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx / .css
    │   │   ├── Timetable.jsx / .css
    │   │   ├── ManageTimetable.jsx / .css
    │   │   ├── HolidayManagement.jsx / .css
    │   │   ├── Profile.jsx / .css
    │   │   ├── Notes.jsx / .css
    │   │   ├── Todo.jsx / .css
    │   │   ├── ExamReminder.jsx / .css
    │   │   └── Notifications.jsx / .css
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   │   └── global.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── .env.example
    └── package.json
```

---

## Installation

### 1. Clone / extract the project

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Environment Variables

### backend/.env

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-student-academy
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### frontend/.env

```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/dashboard | Yes | Dashboard summary |
| GET | /api/profile | Yes | Get profile |
| PUT | /api/profile | Yes | Update profile |
| POST | /api/profile/photo | Yes | Upload photo |
| GET | /api/timetable | Yes | Get timetable |
| POST | /api/timetable | Yes | Add entry |
| PUT | /api/timetable/:id | Yes | Update entry |
| DELETE | /api/timetable/:id | Yes | Delete entry |
| POST | /api/timetable/dayorder | Yes | Set today's day order |
| GET | /api/holidays | Yes | Get holidays |
| POST | /api/holidays | Yes | Add holiday |
| DELETE | /api/holidays/:id | Yes | Delete holiday |
| GET | /api/notes | Yes | Get notes |
| POST | /api/notes | Yes | Upload PDF note |
| DELETE | /api/notes/:id | Yes | Delete note |
| GET | /api/todos | Yes | Get todos |
| POST | /api/todos | Yes | Add todo |
| PUT | /api/todos/:id | Yes | Update todo |
| DELETE | /api/todos/:id | Yes | Delete todo |
| PATCH | /api/todos/:id/toggle | Yes | Toggle complete |
| GET | /api/exams | Yes | Get exams |
| POST | /api/exams | Yes | Add exam |
| PUT | /api/exams/:id | Yes | Update exam |
| DELETE | /api/exams/:id | Yes | Delete exam |
| GET | /api/notifications | Yes | Get notifications |
| PATCH | /api/notifications/read-all | Yes | Mark all read |
| PATCH | /api/notifications/:id/read | Yes | Mark one read |
| DELETE | /api/notifications | Yes | Clear all |
| DELETE | /api/notifications/:id | Yes | Delete one |

---

## Tech Stack

**Frontend:** React 18, Vite, React Router v6, Axios, Context API, CSS (no frameworks)

**Backend:** Node.js, Express.js, JWT, bcryptjs, Multer

**Database:** MongoDB, Mongoose
