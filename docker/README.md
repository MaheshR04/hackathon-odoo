# 🐳 Dayflow HRMS - Docker & Container Management Guide

Welcome to the **Docker Management & Authentication Storage System** for Dayflow HRMS.

---

## 📁 Directory Structure (`/docker`)

```text
oodo/
├── docker/
│   ├── Dockerfile             # Multi-stage production container build
│   ├── docker-compose.yml     # Standalone Docker Compose service manifest
│   ├── env.example            # Environment variables template (JWT, Ports, Auth)
│   ├── auth_config.json       # Authentication & DB storage schema specifications
│   └── README.md              # Container deployment & data management guide
├── Dockerfile                 # Root Dockerfile
└── docker-compose.yml         # Root Docker Compose orchestrator
```

---

## 🔒 Authentication & Data Persistence

### 1. **Password Security**
- User account passwords are encrypted using **`bcryptjs`** with `10 salt rounds`.
- Passwords are never stored in plaintext.

### 2. **Session Authentication**
- Sessions are authenticated via signed **JWT (JSON Web Tokens)** with configurable expiration (`7 days`).
- Configurable via `JWT_SECRET` in `env.example`.

### 3. **Persistent Data Storage**
- All database collections (`employees`, `attendance`, `leaves`, `payrollHistory`, `notifications`) are saved in `server/data/dayflow_db.json`.
- The volume mapping `./server/data:/app/server/data` ensures all registered users, updated passwords, and attendance logs **remain 100% safe and persisted across container restarts or deployments**.

---

## 🚀 How to Run with Docker

### Option A: Using Docker Compose (Recommended)
Run the entire fullstack application (Frontend + Backend + DB Volume) in 1 command:

```bash
# Build and start container in detached mode
docker-compose up -d --build

# View live application logs
docker-compose logs -f

# Stop application
docker-compose down
```

The application will be live at **`http://localhost:5000`**.

---

### Option B: Using Standalone Docker Build

```bash
# Build production image
docker build -t dayflow-hrms -f docker/Dockerfile .

# Run container with volume persistence
docker run -d \
  -p 5000:5000 \
  -v $(pwd)/server/data:/app/server/data \
  --name dayflow_app \
  dayflow-hrms
```

---

## 🔑 Administrative Account Credentials

- **Role**: HR Admin (Single Executive HR Account)
- **Email**: `hr@gmail.com`
- **Default Password**: `password123`
