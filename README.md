# GovTrackerPH

## Purpose
GovTrackerPH is a web application designed to provide transparent, real-time tracking and analytics of government projects in the Philippines. It empowers citizens, administrators, and stakeholders to monitor project progress, comment, and access data-driven insights, fostering accountability and public engagement.

## Features
- **Project Tracking:** View, search, and filter government projects with detailed information and status updates.
- **Comment System:** Users can comment on projects, fostering community feedback and transparency.
- **Admin Dashboard:** (In development) Admins can manage users, projects, comments, and view analytics.
- **Authentication:** Secure login and registration using Supabase and Firebase.
- **Data Visualization:** Interactive charts and statistics for project metrics.
- **Responsive UI:** Modern, mobile-friendly interface using Radix UI and Tailwind CSS.

## Technical Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5.9
- **Backend:** Next.js API routes, Supabase (PostgreSQL), Firebase
- **UI:** Radix UI, Tailwind CSS, Lucide Icons
- **Database:** Supabase (PostgreSQL), with seed and migration scripts
- **Authentication:** Supabase Auth, Firebase Auth
- **Deployment:** Vercel

## Installation & Setup
1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd govtrackerph
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment variables:**
   - Send me an email for the `.env.local.example` & `.env.local`
   - Fill in your Supabase and Firebase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=...
     NEXT_PUBLIC_SUPABASE_ANON_KEY=...
     SUPABASE_URL=...
     SUPABASE_SERVICE_ROLE_KEY=...
     DB_PASSWORD=...
     NEXT_PUBLIC_FIREBASE_API_KEY=...
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
     NEXT_PUBLIC_FIREBASE_APP_ID=...
     ```
4. **Database setup:**
   - Run the database setup scripts in `backend/` to initialize tables and seed data.
   - Example:
     ```sh
     cd backend
     node run-database-setup.mjs
     ```
5. **Start the development server:**
   ```sh
   npm run dev
   ```
6. **Build for production:**
   ```sh
   npm run build
   npm start
   ```

## Folder Structure & Key Files

```
govtrackerph/
├── backend/                  # Backend scripts, database setup, and seed files
│   ├── database/             # SQL files for schema, indexes, and seed data
│   ├── setup-database.js     # (Currently empty) Placeholder for DB setup logic
│   ├── setup-supabase.mjs    # (Currently empty) Placeholder for Supabase setup
│   └── ...
├── public/                   # Static assets (SVGs, images)
├── src/
│   ├── app/                  # Next.js app directory (routing, layouts, pages)
│   │   ├── layout.tsx        # Root layout, global providers
│   │   ├── page.tsx          # Home page (project grid, stats, filters)
│   │   └── ...               # API routes, admin, auth, project pages
│   ├── components/           # UI and feature components
│   │   ├── header.tsx        # Main navigation/header
│   │   ├── project-card.tsx  # Project display card
│   │   ├── project-grid.tsx  # Project grid/listing
│   │   ├── stats-overview.tsx# Statistics dashboard
│   │   └── ...               # UI primitives, admin tabs, etc.
│   ├── context/              # React Context (AuthContext)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries (auth, database, utils)
│   │   ├── auth/             # Auth logic (Firebase, Supabase)
│   │   ├── database/         # Supabase client, helpers
│   ├── models/               # TypeScript models (dim/fact tables)
│   ├── services/             # Service layers for API/data access
│   └── themes/               # Tailwind/theme config
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── ...
```

## Collaboration
- **Branching:** Use feature branches for new features or bug fixes. Name branches descriptively (e.g., `feature/admin-dashboard`).
- **Pull Requests:** Submit PRs for review before merging to `main`. Include clear descriptions and reference related issues.
- **Code Style:** Follow the existing code style and conventions. Use TypeScript and React best practices.
- **Issues:** Use GitHub Issues to report bugs, request features, or discuss improvements.
- **Environment Variables:** Never commit secrets. Use `.env.local` for local development and Vercel dashboard for production secrets.

## Future Work: Admin Dashboard
- **User Management:** Admins can add, remove, and manage user roles.
- **Project Management:** Create, update, and archive projects from the dashboard.
- **Comment Moderation:** Approve, delete, or flag inappropriate comments.
- **Analytics:** View advanced statistics and reports on project progress and user engagement.
- **Security:** Enhanced access controls and audit logs.

---
For questions or contributions, please open an issue or pull request.