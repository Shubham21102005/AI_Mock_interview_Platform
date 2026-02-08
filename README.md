# AI Mock Interview Platform  

![GitHub repo size](https://img.shields.io/github/repo-size/Shubham21102005/AI_Mock_interview_Platform) ![License](https://img.shields.io/github/license/Shubham21102005/AI_Mock_interview_Platform) ![Node.js](https://img.shields.io/badge/Node.js-20%2B-success) ![Next.js](https://img.shields.io/badge/Next.js-15%2B-black) ![Version](https://img.shields.io/badge/Version-1.0.0-blue)

> **AI‑powered mock interview platform** – practice technical interviews with dynamically generated questions, record your answers, receive AI‑driven feedback and track progress over time.

---

## Table of Contents  

- [Overview](#overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Architecture](#architecture)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Backend Setup](#backend-setup)  
  - [Frontend Setup](#frontend-setup)  
- [Usage](#usage)  
  - [Running Locally](#running-locally)  
  - [API Reference](#api-reference)  
- [Development](#development)  
- [Deployment](#deployment)  
- [Contributing](#contributing)  
- [Troubleshooting & FAQ](#troubleshooting--faq)  
- [Roadmap](#roadmap)  
- [License & Credits](#license--credits)  

---

## Overview  

The **AI Mock Interview Platform** lets job‑seekers rehearse technical interviews in a realistic, self‑contained environment:

* **Dynamic interview generation** – Google Gemini (via `@google/genai`) creates role‑specific questions on‑the‑fly.  
* **Answer recording** – Users upload video/audio (handled by Cloudinary) for each question.  
* **AI feedback** – Recorded answers are analysed and scored automatically.  
* **Progress dashboard** – View past sessions, scores, and improvement trends.  

The platform is split into a **Node/Express** backend (REST API, MongoDB) and a **Next.js (React + TypeScript)** frontend.

---

## Features  

| Category | Feature | Status |
|----------|---------|--------|
| **Interview Engine** | AI‑generated questions based on selected role/skill set | ✅ Stable |
| | Randomized follow‑up questions per session | ✅ Stable |
| **Recording** | Video/audio upload via Cloudinary | ✅ Stable |
| | Automatic transcoding & secure storage | ✅ Stable |
| **Feedback** | AI‑driven evaluation of answers (relevance, confidence, clarity) | ✅ Beta |
| | Score & textual feedback displayed in dashboard | ✅ Beta |
| **User Management** | Secure JWT authentication (register / login) | ✅ Stable |
| | Password hashing with bcryptjs | ✅ Stable |
| **Session Management** | CRUD endpoints for interview sessions | ✅ Stable |
| | Export session data as JSON | ✅ Experimental |
| **Dashboard** | Visual progress chart (score over time) | ✅ Stable |
| | Filter sessions by role, date, score | ✅ Stable |
| **Admin / Dev Tools** | CORS whitelist, request logging middleware | ✅ Stable |
| **Design System** | Consistent UI components (see `DESIGN_SYSTEM.md`) | ✅ Stable |

---

## Tech Stack  

| Layer | Technology | Reason |
|-------|------------|--------|
| **Backend** | Node.js 20, Express 5 | Fast, minimalist HTTP server |
| | MongoDB (via Mongoose) | Flexible document store for users & sessions |
| | Google Gemini (`@google/genai`, `@langchain/google-genai`) | State‑of‑the‑art LLM for question generation & feedback |
| | Cloudinary | Secure media upload & CDN delivery |
| | JWT, bcryptjs | Secure authentication |
| | dotenv, cors, multer, streamifier | Environment, CORS, file handling |
| **Frontend** | Next.js 15 (React 19, TypeScript) | Server‑side rendering + API routes |
| | Tailwind CSS 4 | Utility‑first styling |
| | Lucide‑react | Open‑source icons |
| | pdfjs‑dist | Optional PDF resume preview |
| **DevOps** | nodemon (dev server) | Auto‑restart on changes |
| | ESLint (v9) + Tailwind config | Code quality & style |
| | Docker (optional) | Containerised deployment |

---

## Architecture  

```
+-------------------+          +-------------------+          +-------------------+
|   Frontend (SPA)  |  <--->   |   Backend API     |  <--->   |   MongoDB Atlas   |
|  Next.js + TS     |  HTTPS   | Express + Node    |  Mongoose|   (users, sess) |
+-------------------+          +-------------------+          +-------------------+
          |                               |
          |  Cloudinary (media storage)   |
          v                               v
+-------------------+          +-------------------+
|  Cloudinary CDN   |  <--->   |  Google Gemini AI |
+-------------------+          +-------------------+
```

* **`backend/`** – REST API, authentication, session CRUD, AI services.  
* **`frontend/`** – UI components, context providers, pages (`/login`, `/register`, `/dashboard`, `/interview/[id]`).  
* **`DESIGN_SYSTEM.md`** – shared colour palette, spacing, component guidelines.  

Directory highlights  

```
backend/
 ├─ config/          # DB connection
 ├─ controllers/     # auth, interview, session logic
 ├─ middleware/      # auth guard, file upload
 ├─ models/          # Mongoose schemas (User, Session)
 ├─ routes/          # Express routers
 ├─ services/        # AI (Gemini) wrapper
 └─ utils/           # Cloudinary helper

frontend/
 ├─ app/
 │   ├─ components/  # reusable UI
 │   ├─ context/     # auth & session context
 │   ├─ dashboard/   # progress view
 │   ├─ interview/   # live interview UI
 │   ├─ login/       # auth pages
 │   └─ ...          # other feature folders
 └─ public/          # static assets
```

---

## Getting Started  

### Prerequisites  

| Tool | Minimum Version |
|------|-----------------|
| Node.js | **20.x** |
| npm (or Yarn) | **9.x** |
| MongoDB Atlas account (or local MongoDB) | – |
| Cloudinary account | – |
| Google Cloud project with Gemini API enabled | – |
| Git | – |

### Backend Setup  

1. **Clone the repo**  

   ```bash
   git clone https://github.com/Shubham21102005/AI_Mock_interview_Platform.git
   cd AI_Mock_interview_Platform/backend
   ```

2. **Install dependencies**  

   ```bash
   npm ci
   ```

3. **Create a `.env` file** (copy from example below)  

   ```dotenv
   # Server
   PORT=5000

   # MongoDB
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai-mock-interview?retryWrites=true&w=majority

   # JWT
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=7d

   # Cloudinary
   CLOUDINARY_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Google Gemini
   GOOGLE_API_KEY=your_google_gemini_api_key

   # Frontend URL (used for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Run the development server**  

   ```bash
   npm run dev
   ```

   The API will be reachable at `http://localhost:5000`.  
   On start‑up the server connects to MongoDB and prints `Server Running On 5000`.

### Frontend Setup  

1. **Navigate to the frontend folder**  

   ```bash
   cd ../frontend
   ```

2. **Install dependencies**  

   ```bash
   npm ci
   ```

3. **Create a `.env.local` file** (Next.js automatically loads this)  

   ```dotenv
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   ```

4. **Start the dev server**  

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000` in your browser.  

> **Tip:** Both servers can be run concurrently using a tool like `concurrently` or VS Code's multi‑root workspace.

---

## Usage  

### Running Locally  

```bash
# Terminal 1 – backend
cd backend && npm run dev

# Terminal 2 – frontend
cd frontend && npm run dev
```

Visit `http://localhost:3000` → register → start a new interview session.  

### API Reference  

All endpoints are prefixed with `/api` (handled by Express). The backend also serves static files for health checks.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Create a new user (email, password, name) | ❌ |
| `POST` | `/auth/login` | Return JWT + user profile | ❌ |
| `GET` | `/auth/me` | Get current user profile | ✅ |
| `POST` | `/sessions` | Create a new interview session (role, difficulty) | ✅ |
| `GET` | `/sessions` | List all sessions for the logged‑in user | ✅ |
| `GET` | `/sessions/:id` | Get details + AI feedback for a session | ✅ |
| `PUT` | `/sessions/:id` | Update session (e.g., add media URLs) | ✅ |
| `DELETE` | `/sessions/:id` | Remove a session | ✅ |

#### Example: Register a user  

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "StrongPass123!"
      }'
```

#### Example: Create a session (authenticated)  

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"StrongPass123!"}' \
  | jq -r .token)

curl -X POST http://localhost:5000/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "role": "Frontend Engineer",
        "difficulty": "intermediate"
      }'
```

#### Example: Upload a video (multipart)  

```bash
curl -X POST http://localhost:5000/sessions/<sessionId>/media \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/answer.mp4"
```

> The upload route is defined in `sessionRoutes.js` and uses `multer` + Cloudinary.

---

## Development  

| Task | Command |
|------|---------|
| Run backend tests (none yet) | `npm test` |
| Lint frontend | `npm run lint` (frontend) |
| Watch backend with nodemon | `npm run dev` |
| Build frontend for production | `npm run build` |
| Type checking (frontend) | `npx tsc --noEmit` |

### Code Style  

* **Backend** – Standard JavaScript (ES2022) with Prettier formatting (run `npx prettier --write .`).  
* **Frontend** – TypeScript + ESLint (Next.js preset). Follow the **Airbnb** style guide where possible.  

### Debugging  

* Backend request logs appear in the console (`console.log` middleware).  
* Use `DEBUG=express:*` to enable Express debug output.  
* Frontend: open Chrome DevTools → Network tab to inspect API calls.

---

## Deployment  

### Docker (recommended)  

A `Dockerfile` is not included, but you can quickly containerise both services:

```dockerfile
# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ .
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "index.js"]
```

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs .
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start"]
```

Deploy with Docker Compose (example `docker-compose.yml`):

```yaml
version: "3.9"
services:
  backend:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - "5000:5000"
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    env_file: ./frontend/.env.local
    ports:
      - "3000:3000"
    depends_on:
      - backend

  mongo:
    image: mongo:7
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

### Vercel (frontend) & Render / Railway (backend)  

* Frontend: Connect the `frontend/` directory to Vercel – it automatically detects Next.js.  
* Backend: Deploy the `backend/` folder to Render (Node.js) or Railway, ensuring the same environment variables are set.

---

## Contributing  

1. **Fork** the repository.  
2. **Create a feature branch** (`git checkout -b feat/awesome-feature`).  
3. **Install dependencies** (both backend & frontend).  
4. **Make your changes** – ensure they pass linting and any existing tests.  
5. **Write tests** for new functionality (Jest for backend, React Testing Library for frontend).  
6. **Commit** with a clear message (`git commit -m "feat: add AI feedback endpoint"`).  
7. **Push** to your fork and open a **Pull Request** against `main`.  

### Pull Request Checklist  

- [ ] Code follows the project's linting rules.  
- [ ] New/updated functionality is covered by tests.  
- [ ] Documentation (README, inline JSDoc/TS comments) is updated.  
- [ ] No sensitive data (API keys, passwords) are committed.  

---

## Troubleshooting & FAQ  

| Problem | Solution |
|---------|----------|
| **CORS error** when frontend calls backend | Ensure `FRONTEND_URL` in backend `.env` matches the URL you are using (e.g., `http://localhost:3000`). |
| **MongoDB connection fails** | Verify `MONGO_URI` is correct, network access is allowed, and the user has read/write permissions. |
| **Cloudinary upload returns 401** | Double‑check `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. |
| **Google Gemini API returns `403`** | Make sure the API key has the Gemini/Generative AI permission enabled in Google Cloud console. |
| **`npm ci` hangs** | Clear the npm cache (`npm cache clean --force`) and delete `node_modules` before reinstalling. |
| **Frontend shows “Failed to fetch”** | Backend may not be running or the port is mismatched. Verify `NEXT_PUBLIC_BACKEND_URL`. |

If you’re still stuck, open an issue with logs and a short description of the steps you performed.

---

## Roadmap  

- **v1.1** – Real‑time speech‑to‑text transcription for instant feedback.  
- **v1.2** – Role‑specific coding challenges with auto‑graded test cases.  
- **v2.0** – Multi‑user interview rooms (pair‑programming mock interviews).  
- **v2.1** – Admin dashboard for analytics across all users.  

Community suggestions are welcome via GitHub Discussions.

---

## License & Credits  

**License:** MIT – see the `LICENSE` file for details.  

### Contributors  

- **