<div align="center">

# TaskMaster

**Full-stack task management, built with the MERN stack.**

Register, log in, and take control of your day — with a clean interface, drag-and-drop reordering, and motivational progress tracking.

[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-green)](https://www.mongodb.com)

</div>

---

## Features

- **Authentication** — Secure register/login with JWT-based persistent sessions
- **Task CRUD** — Create, edit, complete, and delete tasks with instant visual feedback
- **Rich task details** — Titles, descriptions, categories, and due dates
- **Drag-and-drop reordering** — Powered by `@hello-pangea/dnd`
- **Search & filter** — View All, Active, or Completed tasks in one click
- **Progress tracking** — Daily goal progress, active task count, and streaks
- **Dark mode** — Responsive, minimalist UI with full dark mode support

---

## Tech Stack

| Layer        | Technologies                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------- |
| **Frontend** | React (Vite), Tailwind CSS, Lucide Icons, `@hello-pangea/dnd`, `canvas-confetti`, `date-fns` |
| **Backend**  | Node.js, Express.js, MongoDB, Mongoose, `bcryptjs`, `jsonwebtoken`                           |

---

## Project Structure

```
TaskMaster/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # Register, login, get user
│   │   └── taskController.js      # CRUD + reorder logic
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification
│   ├── models/
│   │   ├── User.js                # User schema
│   │   └── Task.js                # Task schema
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   └── taskRoutes.js          # /api/tasks/*
│   ├── .env                       # Environment variables (git-ignored)
│   └── server.js                  # Express app entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/            # Reusable UI components
    │   ├── pages/                 # Route-level page components
    │   ├── context/               # Auth & task context providers
    │   ├── hooks/                 # Custom React hooks
    │   ├── utils/                 # Helper functions
    │   ├── App.jsx
    │   └── main.jsx
    └── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js `v16+`
- MongoDB (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository

```bash
git clone https://github.com/Rbn-Rmn/TaskMaster.git
cd taskMAster
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongo_uri_here
JWT_SECRET=your_strong_secret_here
```

Start the development server:

```bash
npm run dev
```

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app

Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

### Auth routes

> Public endpoints — no authentication required.

| Method | Endpoint             | Description                                        |
| ------ | -------------------- | -------------------------------------------------- |
| `POST` | `/api/auth/register` | Create a new account (`name`, `email`, `password`) |
| `POST` | `/api/auth/login`    | Log in (`email`, `password`)                       |
| `GET`  | `/api/auth/me`       | Get the authenticated user's profile               |

### Task routes

> Protected — include a valid JWT in the `Authorization` header.

| Method   | Endpoint             | Description                                       |
| -------- | -------------------- | ------------------------------------------------- |
| `GET`    | `/api/tasks`         | Fetch all tasks for the current user              |
| `POST`   | `/api/tasks`         | Create a new task                                 |
| `PUT`    | `/api/tasks/:id`     | Update a task by ID                               |
| `DELETE` | `/api/tasks/:id`     | Delete a task by ID                               |
| `PUT`    | `/api/tasks/reorder` | Update task order — body: `{ taskIds: string[] }` |

All task operations are scoped to the authenticated user.

---

## Environment Variables

```env
# backend/.env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## Contributing

Contributions, issues, and pull requests are welcome. Feel free to [open an issue](https://github.com/Rbn-Rmn/TaskMaster/issues) to discuss changes before submitting a PR.

---

## Acknowledgements

- Icons — [Lucide](https://lucide.dev)
- Drag & drop — [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- Confetti — [canvas-confetti](https://github.com/catdad/canvas-confetti)

---

<div align="center">

**TaskMaster** · Stay organized. Stay productive.

</div>
