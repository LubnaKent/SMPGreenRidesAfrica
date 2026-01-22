# Supabase Setup Instructions

Follow these steps to set up your Supabase database for SMP Green Rides Africa.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: `smp-green-rides` (or your preference)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to Uganda (e.g., `eu-west-1` or `af-south-1`)
4. Click "Create new project" and wait for setup (~2 minutes)

## 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## 3. Create Environment File

Create a `.env.local` file in your project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Run the Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

You should see "Success. No rows returned" - this is normal for DDL statements.

## 5. Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name it: `driver-documents`
4. Toggle **Public bucket** to ON (for easier file access)
5. Click **Create bucket**

### Set Storage Policies

1. Click on the `driver-documents` bucket
2. Go to **Policies** tab
3. Add these policies:

**For SELECT (viewing files):**
```sql
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'driver-documents');
```

**For INSERT (uploading files):**
```sql
CREATE POLICY "SMP team can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'driver-documents');
```

**For DELETE (removing files):**
```sql
CREATE POLICY "SMP admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'driver-documents');
```

## 6. Configure Authentication

1. Go to **Authentication** > **Providers**
2. Ensure **Email** is enabled (should be by default)
3. Go to **Authentication** > **URL Configuration**
4. Set:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/**`

### For Production:
- Update Site URL to your Vercel domain
- Add your production URL to Redirect URLs

## 7. Create Your First Admin User

1. Go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter:
   - Email: Your admin email
   - Password: A secure password
4. Click **Create user**

### Set Admin Role

Run this in SQL Editor (replace the email):

```sql
UPDATE profiles
SET role = 'smp_admin'
WHERE email = 'your-admin@email.com';
```

## 8. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Go to `http://localhost:3000`
3. Log in with your admin credentials
4. Try adding a driver

## 9. Enable Real-time (Optional)

For live pipeline updates:

1. Go to **Database** > **Replication**
2. Under "Supabase Realtime", toggle ON for:
   - `drivers`
   - `status_history`
   - `handovers`

## Troubleshooting

### "No rows returned" on schema.sql
This is normal - DDL (CREATE, ALTER) statements don't return rows.

### "relation already exists"
The schema has already been run. You can drop and recreate if needed, or skip.

### "permission denied"
Check your RLS policies are correctly set up.

### Auth not working
- Verify your environment variables are correct
- Check the Supabase Auth > Users page for any blocked users
- Ensure email confirmation is disabled in Auth settings (for testing)

## Database Maintenance

### View All Drivers
```sql
SELECT * FROM drivers ORDER BY created_at DESC;
```

### View Driver Stats
```sql
SELECT * FROM driver_stats;
```

### View Monthly Progress
```sql
SELECT * FROM monthly_acquisitions;
```

### Reset All Data (DANGER!)
```sql
TRUNCATE drivers, driver_documents, screening_responses, status_history, handovers CASCADE;
```

## Backup

Supabase automatically backs up your database daily. For manual backups:
1. Go to **Settings** > **Database**
2. Scroll to "Database Backups"
3. Click to download a backup
