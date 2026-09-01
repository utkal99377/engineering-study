# B.Tech Learning, Assessment & Programming Practice Platform (v2.0)

A dynamic, production-grade learning management platform and multi-language isolated coding sandbox designed specifically for B.Tech CSE, IT, and engineering branch students.

---

## 🌟 Key Architecture & Features

1. **Fully Dynamic & Data-Driven Backend**:
   - Course catalog, subjects (C, C++, Java, Python, JavaScript, SQL, DSA), modules, lectures, resources, theory MCQs, and subscription plans are backend-managed via an Admin CMS with zero app rebuilds.
   - Built with **FastAPI**, **SQLAlchemy** (supporting SQLite & PostgreSQL), **JWT Authentication**, and **Role-Based Access Control (RBAC)**.

2. **Sequential Prerequisite Progression**:
   - Server-enforced unlocking states: `Locked`, `Available`, `In Progress`, `Completed`, `Premium Locked`.
   - Prerequisite completion is verified strictly on the backend to prevent client-side bypass.

3. **Isolated Sandbox Code Runner**:
   - Multi-language support: **Python, JavaScript (Node.js), C, C++**.
   - Subprocess sandbox with timeout protection, memory limits, and automated grading against public sample cases and hidden test cases.

4. **Theory & MCQ Assessment Engine**:
   - Objective MCQs with automated score calculation, real-time explanation cards, exam-oriented important question flags, and accuracy tracking.

5. **Subscription & Entitlement Layer**:
   - Configurable plans: Free Starter, Pro Monthly, Engineering Annual Pass.
   - Promotional discount coupon validator (`BTECH50`, `FRESHER100`) and simulated checkout with instant entitlement provisioning.

6. **Content Security & Dynamic Watermarking**:
   - Dynamic anti-screen recording watermark overlay rendering verified user email and timestamp signature across protected lecture media and notes.

7. **Curated B.Tech Datasets Directory (`datasets/`)**:
   - Pre-populated with engineering curricula and equipped with a 1-click **Admin Data Sync / Importer** so instructors can modify or add data easily via UI or files.

8. **Multi-Platform Ecosystem**:
   - **Modern Web Application & Admin CMS**: Responsive Vite + React with dark/light themes and glassmorphism.
   - **Android PWA**: Standalone installable PWA with offline service worker.
   - **Flutter Client (`mobile_flutter/`)**: Ready for Android Play Store App Bundle (`.aab`) compilation.

---

## 🚀 Quick Start Guide

### 1. Automated 1-Click Launch (Windows)
Double-click [`start_platform.bat`](file:///c:/Users/Utkal/.gemini/antigravity-ide/scratch/btech_learning_platform/start_platform.bat) or run in PowerShell:
```powershell
.\start_platform.ps1
```

### 2. Manual Start
#### Backend:
```bash
python -m pip install -r backend/requirements.txt
python backend/run_backend.py
```
Backend runs at: `http://localhost:8001` (Swagger UI: `http://localhost:8001/docs`)

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🔑 Default Demo Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Student** | `student@btechlearn.edu` | `Student@2026` | Standard student access to courses, MCQs & Code Sandbox |
| **Administrator** | `admin@btechlearn.edu` | `Admin@2026` | Full Admin CMS, CRUD on courses/problems/plans, Dataset Importer |

---

## 📁 Repository Structure

```
btech_learning_platform/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST Endpoints (Auth, Courses, Lectures, Problems, Subscriptions, Admin, DataIO)
│   │   ├── core/            # Config, Database, Security & JWT, RBAC
│   │   ├── models/          # SQLAlchemy Models (User, Course, Module, Lecture, Submission, Plan, etc.)
│   │   ├── schemas/         # Pydantic Schemas
│   │   ├── services/        # Entitlement, Progression, Sandbox Runner, Seeder
│   │   └── main.py          # FastAPI Application Assembly
│   ├── tests/               # Pytest Automated Test Suite
│   ├── requirements.txt
│   └── run_backend.py
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, WatermarkOverlay, CodeEditor, TheoryQuiz, NotesViewer, SubscriptionModal
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Home, Catalog, CourseDetail, LecturePlayer, TheoryPractice, CodingArena, IDE, CMS
│   │   ├── services/        # Unified API Client
│   │   ├── App.jsx
│   │   └── index.css        # Modern Design System & Glassmorphism
│   ├── public/              # PWA Manifest, Favicon, Service Worker
│   ├── package.json
│   └── vite.config.js
├── datasets/
│   ├── subjects.json        # Core B.Tech Languages (Python, C, C++, Java, JS, SQL, DSA)
│   ├── courses.json         # Free and Pro Engineering Courses
│   ├── modules_lectures.json# Sequential Modules with Video Links & Markdown Notes
│   ├── theory_questions.json# 4-Option MCQs & Explanations
│   ├── coding_problems.json # Programming Challenges & Test Cases
│   ├── subscription_plans.json # Pro Plans & Discount Coupons
│   └── README.md
├── mobile_flutter/          # Flutter Client for Android Google Play Store
├── start_platform.bat       # Windows 1-Click Launcher
├── start_platform.ps1
└── README.md
```

---

## 🧪 Running Automated Tests
```bash
python -m pytest backend/tests/test_api.py -v
```
