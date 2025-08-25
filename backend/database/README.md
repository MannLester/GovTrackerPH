# Database Setup Instructions

This folder contains the SQL scripts to set up your GovTracker PH database in PostgreSQL/Supabase.

## Files Overview

1. **01_create_tables.sql** - Creates all dimension and fact tables
2. **02_indexes_triggers.sql** - Adds performance indexes and automation triggers  
3. **03_seed_data.sql** - Inserts sample data for testing

## Setup Instructions

### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the scripts in order:
   - Copy and paste `01_create_tables.sql` → Run
   - Copy and paste `02_indexes_triggers.sql` → Run  
   - Copy and paste `03_seed_data.sql` → Run

### Option B: Using psql Command Line

```bash
# Connect to your database
psql -h your-supabase-host -p 5432 -d postgres -U postgres

# Run scripts in order
\i 01_create_tables.sql
\i 02_indexes_triggers.sql  
\i 03_seed_data.sql
```

### Option C: Using Node.js Script

Create a `setup-database.js` script to run from your backend:

```javascript
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupDatabase() {
  const scripts = [
    '01_create_tables.sql',
    '02_indexes_triggers.sql', 
    '03_seed_data.sql'
  ];

  for (const script of scripts) {
    const sql = fs.readFileSync(script, 'utf8');
    await pool.query(sql);
    console.log(`✅ ${script} executed successfully`);
  }
}
```

## What Gets Created

### Dimension Tables
- `dim_status` - Project and user statuses
- `dim_location` - Philippine geographic locations
- `dim_contractor` - Construction companies
- `dim_user` - System users (citizens, admin, personnel)
- `dim_project` - Government projects
- `dim_comment` - User comments on projects
- `dim_stats` - Project statistics (auto-updated)

### Fact Tables  
- `fact_project_likes` - User likes on projects
- `fact_comment_likes` - User likes on comments
- `fact_project_images` - Project photos/images
- `fact_project_milestones` - Project progress milestones
- `fact_project_personnel` - Staff assigned to projects

### Features
- ✅ UUID primary keys
- ✅ Foreign key relationships
- ✅ Performance indexes
- ✅ Auto-updating timestamps
- ✅ Auto-updating statistics
- ✅ Sample Philippine data
- ✅ Admin and test users

## Sample Data Included

- **8 status types** (Planning, In Progress, Completed, etc.)
- **8 Philippine locations** (Manila, Quezon City, Cebu, etc.)
- **5 sample contractors**
- **4 test users** (admin, personnel, citizens)
- **4 sample projects** (Manila Bay, QC Traffic, Cebu IT Park, Clark Green City)
- **Sample comments, likes, and milestones**

## Default Login Credentials

All test users use password: `password123`

- **Super Admin**: `admin@govtracker.ph`
- **Admin**: `juan.delacruz@gov.ph`  
- **Personnel**: `maria.santos@gov.ph`
- **Citizen**: `citizen@email.com`

## Next Steps

After running these scripts:
1. Verify tables were created in Supabase dashboard
2. Test with sample queries
3. Set up Row Level Security (RLS) policies if needed
4. Connect your Node.js backend to the database

## Environment Variables Needed

```env
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/[database]
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
