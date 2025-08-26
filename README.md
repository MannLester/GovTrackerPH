<h1 align="center">GovTrackerPH</h1>

## Project Overview

GovTrackerPH is a full-stack web application designed to promote transparency and civic engagement by tracking government projects across the Philippines. The platform enables users to view, search, and interact with public infrastructure projects, see statistics, and participate through voting and comments. It features robust authentication, a modern UI, and a scalable architecture suitable for both citizens and administrators.

---

## Tech Stack

- **Frontend:** Next.js (App Router), React 19, TypeScript, Tailwind CSS, Radix UI, Lucide Icons, Recharts
- **Backend:** Supabase (PostgreSQL, Auth, Storage), Firebase (Google Auth), Node.js (for scripts)
- **State/Context:** React Context API
- **API/Services:** RESTful endpoints (via Next.js API routes), Supabase client, custom service layers

---

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

---

## Detailed Workflow & Architecture

### 1. Database & Backend

- **Supabase** is used as the primary backend (PostgreSQL, Auth, Storage). All project/user/comment data is stored and accessed via Supabase.
- **Database schema** is defined in `backend/database/` (currently empty, but intended for SQL migrations and seed data).
- **Backend scripts** (currently placeholders) are intended for database setup and integration with Supabase.
- **API routes** are implemented in `src/app/api/` using Next.js API routes, providing endpoints for projects, comments, stats, admin, etc.

### 2. Authentication

- **Google Sign-In** is implemented via Firebase Auth (`src/lib/auth/supabase-auth.ts`).
- On sign-in, user data is synchronized to Supabase for unified user management.
- The `AuthContext` (`src/context/AuthContext.tsx`) provides authentication state and methods to the entire app.

### 3. Frontend (Next.js App)

- **App Router**: Uses Next.js 15 App Router for routing, layouts, and server/client components.
- **Global Providers**: The root layout wraps the app in `AuthProvider` for authentication context.
- **UI Components**: Modular, reusable components for cards, tables, dialogs, forms, and admin dashboards. Built with Tailwind CSS and Radix UI for accessibility and design consistency.
- **Pages**:
  - `/` (Home): Project grid, filters, statistics, and search.
  - `/auth`: Authentication page (Google sign-in).
  - `/admin`: Admin dashboard (user/project management, analytics, security, etc.).
  - `/project/[id]`: Project detail view.
  - `/api/*`: API endpoints for data access.

### 4. Data Flow & Services

- **Service Layer**: All data fetching/mutations are abstracted in `src/services/` (e.g., `projectsService.ts`).
- **Models**: TypeScript interfaces for all entities (Project, User, Comment, etc.) in `src/models/`.
- **Supabase Client**: Configured in `src/lib/database/client.ts` and `src/services/supabaseClient.ts` for secure, typed access to the database.

### 5. UI/UX

- **Modern, Responsive UI**: Built with Tailwind CSS, Radix UI, and custom components.
- **Project Cards**: Show project info, status, location, budget, contractor, progress, and images.
- **Statistics Dashboard**: Real-time stats on projects, users, and engagement.
- **Search & Filters**: Users can search/filter projects by location, status, etc.
- **Voting & Comments**: Users can like/dislike projects and leave comments (fact tables).
- **Admin Panel**: Tabs for managing users, projects, comments, analytics, and security.

---

## Current Progress & Status

- **Frontend**: Core UI, routing, authentication, and service layers are implemented. Most major components are present and functional.
- **Backend**: Supabase integration is complete; backend scripts and SQL files are placeholders (to be filled for full DB setup/migrations).
- **Authentication**: Google sign-in and Supabase user sync are working.
- **Data Models**: TypeScript models for all major entities are defined.
- **API**: Next.js API routes are scaffolded for all major resources.
- **Admin Features**: UI and structure are present; business logic may need further implementation.
- **Testing/Validation**: Not fully implemented; recommend adding unit/integration tests.

---

## Replication Guide (Step-by-Step)

1. **Clone the repository**
   ```bash
   git clone https://github.com/MannLester/GovTrackerPH.git
   cd GovTrackerPH
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or yarn install
   ```

3. **Set up environment variables**
   - Create a `.env.local` file in the root directory.
   - Add the following (replace with your own keys):
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
     NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
     NEXT_PUBLIC_API_URL=http://localhost:3000/api
     ```

4. **Configure Supabase**
   - Set up a Supabase project and database.
   - Define tables for `dim_project`, `dim_user`, `fact_comment_likes`, etc. (see `src/models/` for schema).
   - (Optional) Use `backend/database/` SQL files for migrations (currently empty; fill as needed).

5. **Configure Firebase**
   - Set up a Firebase project for Google Auth.
   - Enable Google sign-in and copy credentials to `.env.local`.

6. **Run the development server**
   ```bash
   npm run dev
   # or yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

7. **(Optional) Deploy**
   - Deploy to Vercel or your preferred platform. Set environment variables in the deployment dashboard.

---

## Notes for Replication

- The backend folder contains placeholders for future scripts and SQL migrations. For a full production setup, implement these scripts and fill the SQL files.
- All business logic for authentication, data fetching, and mutations is handled in the service and context layers.
- The UI is modular and can be extended with new features or admin tools as needed.
- For full feature parity, ensure Supabase and Firebase are configured with the correct tables, roles, and API keys.

---

## Contact & Contribution

- For questions, contact the project owner or open an issue on GitHub.
- Contributions are welcome! Please fork the repo and submit a pull request.

---

**This README is designed to enable an AI or developer to fully replicate, extend, or deploy the GovTrackerPH project.**
