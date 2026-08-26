# MAD Connect

MAD Connect is a Chapter Management & Intelligence System built for MAD to streamline volunteer management, attendance, analytics, and chapter performance. Built with HTML, CSS, JavaScript, Firebase, Firestore & Chart.js, it provides role-based dashboards and data-driven insights while reducing dependence on Excel and manual workflows.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Authentication & Roles](#authentication--roles)
- [Pages Overview](#pages-overview)
- [Database Collections](#database-collections)
- [Deployment](#deployment)

---

## Features

| Feature | Description |
|---------|-------------|
| **Role-Based Login** | Separate access for Chapter Organisers and Admins with email/password auth |
| **Chapter Dashboard** | Personalized dashboard with volunteer stats, attendance rate, and quick actions |
| **Volunteer Management** | Full CRUD — add, edit, delete volunteers with search and status tracking |
| **Attendance Tracking** | Mark per-session attendance with date picker, present/absent counts, and history view |
| **Analytics** | Interactive charts — volunteer status breakdown (doughnut) and attendance trends over time (line) via Chart.js |
| **MAD Connect Network** | Browse all chapters nationwide, view health status, contact CHOs, and see chapter details |
| **Recognition System** | Volunteer spotlight, chapter leaderboard, milestone badges, and top performers |
| **Stories Platform** | Write, edit, publish stories with tags, status workflow (draft → review → published), and search |
| **Photo Gallery** | Upload categorized photos (class/event/milestone/community) with lightbox view and admin moderation |
| **Smart Alerts** | Auto-generated notifications for low attendance, high performance, and missing volunteers |
| **Admin Dashboard** | Network-wide stats, health chart, chapter performance ranking, activity feed, and audit log |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Backend** | Next.js API Routes |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Charts** | Chart.js, react-chartjs-2 |
| **Styling** | CSS Variables, Glassmorphism, Poppins font |
| **Hosting** | Vercel |
| **Version Control** | Git / GitHub |

---

## Project Structure

```
MADConnect/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (imports all CSS)
│   ├── page.tsx                # Root page (redirects to login/dashboard)
│   ├── globals.css             # CSS variables and reset
│   │
│   ├── login/page.tsx          # Login page
│   ├── dashboard/page.tsx      # Chapter dashboard
│   ├── volunteers/page.tsx     # Volunteer CRUD
│   ├── attendance/page.tsx     # Attendance marking & history
│   ├── analytics/page.tsx      # Charts and insights
│   ├── madconnect/page.tsx     # Network chapter directory
│   ├── recognition/page.tsx    # Volunteer recognition & leaderboard
│   ├── stories/page.tsx        # Story CRUD
│   ├── gallery/page.tsx        # Photo gallery with lightbox
│   ├── alerts/page.tsx         # Smart notifications
│   ├── admin/page.tsx          # Admin dashboard
│   ├── settings/page.tsx       # Account info & logout
│   │
│   └── api/                    # API Routes
│       ├── auth/login/route.ts # JWT authentication
│       ├── volunteers/route.ts # Volunteer CRUD API
│       ├── attendance/route.ts # Attendance API
│       ├── chapters/route.ts   # Chapter data API
│       ├── stories/route.ts    # Stories API
│       ├── gallery/route.ts    # Gallery API
│       └── users/route.ts      # User management API
│
├── components/                 # React components
│   ├── Sidebar.tsx             # Navigation sidebar
│   └── Toast.tsx               # Toast notifications
│
├── lib/                        # Server-side libraries
│   ├── mongodb.ts              # MongoDB connection singleton
│   ├── auth.ts                 # JWT auth utilities
│   └── models/                 # Mongoose models
│       ├── User.ts
│       ├── Chapter.ts
│       ├── Volunteer.ts
│       ├── Attendance.ts
│       ├── Story.ts
│       └── Gallery.ts
│
├── css/                        # Original CSS files (imported globally)
│   ├── shared.css              # Sidebar, cards, toast, modals, layout
│   ├── login.css, dashboard.css, admin.css, attendance.css,
│   │   volunteers.css, analytics.css, madconnect.css,
│   │   recognition.css, stories.css, gallery.css,
│   │   alerts.css, settings.css
│
├── public/                     # Static assets
│   └── mad.logo.png            # MAD logo
│
├── scripts/
│   └── seed.mjs                # Database seed script
│
├── js/                         # Legacy vanilla JS (migrated to React)
├── pages/                      # Legacy HTML pages (migrated to React)
│
├── .env.local                  # Environment variables (gitignored)
├── .env.example                # Environment variable template
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── vercel.json                 # Vercel deployment config
├── package.json                # Dependencies
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- MongoDB Atlas account (or local MongoDB)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/sakshamsharma2806-spec/MADConnect.git
   cd MADConnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your MongoDB URI and JWT secret:
   ```
   MONGODB_URI=mongodb+srv://your-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Seed the database**
   ```bash
   node scripts/seed.mjs
   ```

5. **Start the dev server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:3000`

### Default Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@makeadiff.in | password123 |
| CHO | saksham@makeadiff.in | password123 |

---

## Authentication & Roles

| Role | Access |
|------|--------|
| **Chapter Organizer (CHO)** | Dashboard, own chapter's volunteers, attendance, analytics, stories, gallery, recognition, alerts, settings |
| **Admin / Core Member** | All CHO features + Admin Dashboard + network-wide data + gallery moderation + direct story publishing |

- Authentication uses JWT tokens stored in cookies
- API routes are protected via `lib/auth.ts` middleware
- Passwords are hashed with bcryptjs

---

## Pages Overview

| Page | Purpose |
|------|---------|
| **Login** (`/login`) | Email/password login with role selection |
| **Dashboard** (`/dashboard`) | Chapter stats, quick actions, today's attendance, recent activity |
| **Volunteers** (`/volunteers`) | Manage volunteers — add/edit/delete with search and status tracking |
| **Attendance** (`/attendance`) | Mark per-session attendance, view history with detail modals |
| **Analytics** (`/analytics`) | Volunteer status chart + attendance trend line chart |
| **MAD Connect** (`/madconnect`) | Network-wide chapter directory with health badges and contact |
| **Recognition** (`/recognition`) | Spotlight, leaderboard, milestone badges, top performers |
| **Stories** (`/stories`) | Blog/story editor with tags, status workflow, search |
| **Gallery** (`/gallery`) | Photo uploads by category with lightbox and admin moderation |
| **Alerts** (`/alerts`) | Auto-generated smart notifications with filters |
| **Admin** (`/admin`) | Global stats, health chart, chapter performance, audit log |
| **Settings** (`/settings`) | Account info display and logout |

---

## Database Collections

| Collection | Description |
|------------|-------------|
| `users` | User accounts with name, email, role (`cho`/`admin`/`core`), and chapter assignment |
| `chapters` | Chapter definitions — name, city, CHO details, shelter home, status |
| `volunteers` | Volunteer records — name, phone, shelter, status per chapter |
| `attendance` | Session attendance records — date, shelter, list of present volunteers |
| `stories` | Blog posts — title, content, tags, status, author info |
| `gallery` | Photo entries — title, description, category, moderation status |

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### GitHub Integration

Connect your GitHub repo to Vercel at [vercel.com/new](https://vercel.com/new) for automatic deployments on every push.

### Environment Variables on Vercel

Set these in your Vercel project settings:
- `MONGODB_URI` — Your MongoDB connection string
- `JWT_SECRET` — A strong secret for JWT signing

---

## Legacy Files

The `js/`, `pages/`, `build.js`, and `image/` directories contain the original Firebase-based vanilla JS implementation. These files have been migrated to the Next.js + MongoDB stack and are kept for reference only. The active codebase is in `app/`, `lib/`, `components/`, and `css/`.

---

**Built with care for the MAD community.**
