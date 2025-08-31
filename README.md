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
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── placeholder.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/                  # Next.js app directory (routing, layouts, pages)
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx        # Root layout, global providers
│   │   ├── page.tsx          # Home page (project grid, stats, filters)
│   │   ├── admin/            # Admin dashboard pages
│   │   │   ├── layout.tsx
│   │   │   ├── page-new.tsx
│   │   │   └── page.tsx
│   │   ├── api/              # API routes
│   │   │   └── ...           # Nested API endpoints (admin, auth, comments, health, projects, setup, stats, test)
│   │   ├── project/          # Project detail pages
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   ├── components/           # UI and feature components
│   │   ├── comment-section.tsx
│   │   ├── header.tsx
│   │   ├── mock-data-modal.tsx
│   │   ├── project-card.tsx
│   │   ├── project-detail.tsx
│   │   ├── project-filters.tsx
│   │   ├── project-grid.tsx
│   │   ├── stats-overview.tsx
│   │   ├── status-legend.tsx
│   │   ├── admin/            # Admin dashboard components
│   │   │   ├── admin-guard.tsx
│   │   │   ├── admin-mail-tab.tsx
│   │   │   ├── analytics-dashboard.tsx
│   │   │   ├── bulk-ops-tab.tsx
│   │   │   ├── comments-tab.tsx
│   │   │   ├── metrics-tab.tsx
│   │   │   ├── projects-tab.tsx
│   │   │   ├── security-tab.tsx
│   │   │   └── users-tab.tsx
│   │   ├── ui/               # UI primitives
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── search-filter.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   └── tooltip.tsx
│   ├── context/              # React Context (AuthContext)
│   │   └── AuthContext.tsx
│   ├── lib/                  # Utility libraries (auth, database, utils)
│   │   ├── firebase.ts
│   │   ├── utils.ts
│   │   ├── auth/             # Auth logic (Firebase, Supabase)
│   │   │   ├── config-new.ts
│   │   │   ├── config.ts
│   │   │   └── supabase-auth.ts
│   │   ├── database/         # Supabase client, helpers, repositories
│   │   │   ├── client.ts
│   │   │   ├── config.ts
│   │   │   ├── types.ts
│   │   │   └── repositories/
│   │   │       ├── admin.ts
│   │   │       ├── comments.ts
│   │   │       ├── fact-project-images.ts
│   │   │       ├── milestones.ts
│   │   │       ├── projects.ts
│   │   │       └── users.ts
│   ├── models/               # TypeScript models (dim/fact tables)
│   │   ├── dim-models/
│   │   │   ├── dim-comment.tsx
│   │   │   ├── dim-contractor.tsx
│   │   │   ├── dim-location.tsx
│   │   │   ├── dim-project.tsx
│   │   │   ├── dim-stats.tsx
│   │   │   ├── dim-status.tsx
│   │   │   └── dim-user.tsx
│   │   ├── fact-models/
│   │   │   ├── fact-comment-likes.tsx
│   │   │   ├── fact-project-images.tsx
│   │   │   ├── fact-project-likes.tsx
│   │   │   ├── fact-project-milestones.tsx
│   │   │   ├── fact-project-personnel.tsx
│   │   │   └── fact-reports.tsx
│   ├── services/             # Service layers for API/data access
│   │   ├── adminService.ts
│   │   ├── firebaseClient.ts
│   │   ├── projectsService.ts
│   │   └── supabaseClient.ts
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── eslint.config.mjs         # ESLint config
├── next.config.ts            # Next.js config
├── postcss.config.mjs        # PostCSS config
├── components.json           # (Optional) Component registry
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
- **Added Feature:** Budget breakdown of the projects.
- **Added Feature:** Contractor Profiles with their previous works.

---
For questions or contributions, please open an issue or pull request.