-- ============================================
-- Row Level Security Policies (UPDATED - More Secure)
-- Run this in Supabase SQL Editor
--
-- IMPORTANT: Run these commands to drop existing policies first:
-- DROP POLICY IF EXISTS "policy_name" ON table_name;
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE handovers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES (run if updating)
-- ============================================
-- Uncomment these if you need to replace existing policies:
/*
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view drivers" ON drivers;
DROP POLICY IF EXISTS "SMP team can insert drivers" ON drivers;
DROP POLICY IF EXISTS "SMP team can update drivers" ON drivers;
DROP POLICY IF EXISTS "SMP admins can delete drivers" ON drivers;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON driver_documents;
DROP POLICY IF EXISTS "SMP team can insert documents" ON driver_documents;
DROP POLICY IF EXISTS "SMP team can update documents" ON driver_documents;
DROP POLICY IF EXISTS "Authenticated users can view screening" ON screening_responses;
DROP POLICY IF EXISTS "SMP team can insert screening" ON screening_responses;
DROP POLICY IF EXISTS "Authenticated users can view history" ON status_history;
DROP POLICY IF EXISTS "SMP team can insert history" ON status_history;
DROP POLICY IF EXISTS "Authenticated users can view handovers" ON handovers;
DROP POLICY IF EXISTS "SMP admins can manage handovers" ON handovers;
DROP POLICY IF EXISTS "SMP admins can update handovers" ON handovers;
*/

-- ============================================
-- HELPER FUNCTION: Get current user's role
-- ============================================
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_admin'
    )
  );

-- Admins can update any profile (including roles)
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_admin'
    )
  );

-- Security officers can view profiles for verification
CREATE POLICY "Security officers can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'security_officer'
    )
  );

-- ============================================
-- DRIVERS POLICIES (ROLE-BASED ACCESS)
-- ============================================

-- SMP Admins can view all drivers
CREATE POLICY "Admins can view all drivers"
  ON drivers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_admin'
    )
  );

-- SMP Agents can view all drivers (they manage the pipeline)
CREATE POLICY "Agents can view all drivers"
  ON drivers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_agent'
    )
  );

-- Security Officers can view drivers for vetting
CREATE POLICY "Security officers can view drivers"
  ON drivers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'security_officer'
    )
  );

-- Partners can ONLY view drivers that have been handed over
CREATE POLICY "Partners can view handed over drivers"
  ON drivers FOR SELECT
  TO authenticated
  USING (
    status = 'handed_over' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'partner'
    )
  );

-- Drivers can view their own record (self-service portal)
CREATE POLICY "Drivers can view own record"
  ON drivers FOR SELECT
  TO authenticated
  USING (
    -- Match by email from auth.users
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'driver'
    )
  );

-- SMP admins and agents can insert drivers
CREATE POLICY "SMP team can insert drivers"
  ON drivers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('smp_admin', 'smp_agent')
    )
  );

-- SMP team can update drivers
CREATE POLICY "SMP team can update drivers"
  ON drivers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('smp_admin', 'smp_agent')
    )
  );

-- Security officers can update driver verification status
CREATE POLICY "Security can update driver verification"
  ON drivers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'security_officer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'security_officer'
    )
  );

-- Only admins can delete drivers
CREATE POLICY "SMP admins can delete drivers"
  ON drivers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'smp_admin'
    )
  );

-- ============================================
-- DRIVER DOCUMENTS POLICIES (ROLE-BASED)
-- ============================================

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_admin'
    )
  );

-- Agents can view documents they need for pipeline management
CREATE POLICY "Agents can view documents"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_agent'
    )
  );

-- Security officers can view documents for vetting
CREATE POLICY "Security can view documents"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'security_officer'
    )
  );

-- Partners can view documents only for handed over drivers
CREATE POLICY "Partners can view handed over driver documents"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = driver_documents.driver_id
      AND d.status = 'handed_over'
    ) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'partner'
    )
  );

-- Drivers can view their own documents
CREATE POLICY "Drivers can view own documents"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = driver_documents.driver_id
      AND d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'driver'
    )
  );

-- SMP team can insert documents
CREATE POLICY "SMP team can insert documents"
  ON driver_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('smp_admin', 'smp_agent')
    )
  );

-- Drivers can upload their own documents
CREATE POLICY "Drivers can insert own documents"
  ON driver_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = driver_documents.driver_id
      AND d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'driver'
    )
  );

-- SMP team and security can update documents
CREATE POLICY "SMP team can update documents"
  ON driver_documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('smp_admin', 'smp_agent', 'security_officer')
    )
  );

-- Only admins can delete documents
CREATE POLICY "Admins can delete documents"
  ON driver_documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_admin'
    )
  );

-- ============================================
-- SCREENING RESPONSES POLICIES (ROLE-BASED)
-- ============================================

-- Admins and agents can view screening responses
CREATE POLICY "SMP team can view screening"
  ON screening_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('smp_admin', 'smp_agent')
    )
  );

-- Security officers can view screening for vetting
CREATE POLICY "Security can view screening"
  ON screening_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'security_officer'
    )
  );

-- Drivers can view their own screening responses
CREATE POLICY "Drivers can view own screening"
  ON screening_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = screening_responses.driver_id
      AND d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'driver'
    )
  );

-- SMP team can insert screening responses
CREATE POLICY "SMP team can insert screening"
  ON screening_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('smp_admin', 'smp_agent')
    )
  );

-- Drivers can submit their own screening responses
CREATE POLICY "Drivers can insert own screening"
  ON screening_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = screening_responses.driver_id
      AND d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'driver'
    )
  );

-- ============================================
-- STATUS HISTORY POLICIES (ROLE-BASED)
-- ============================================

-- Admins and agents can view all history
CREATE POLICY "SMP team can view history"
  ON status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('smp_admin', 'smp_agent')
    )
  );

-- Security officers can view history for audit
CREATE POLICY "Security can view history"
  ON status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'security_officer'
    )
  );

-- Drivers can view their own status history
CREATE POLICY "Drivers can view own history"
  ON status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = status_history.driver_id
      AND d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'driver'
    )
  );

-- SMP team can insert history (usually automatic via triggers)
CREATE POLICY "SMP team can insert history"
  ON status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('smp_admin', 'smp_agent')
    )
  );

-- ============================================
-- HANDOVERS POLICIES (ROLE-BASED)
-- ============================================

-- Admins can view all handovers
CREATE POLICY "Admins can view all handovers"
  ON handovers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_admin'
    )
  );

-- Agents can view handovers
CREATE POLICY "Agents can view handovers"
  ON handovers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_agent'
    )
  );

-- Partners can view handovers assigned to them
CREATE POLICY "Partners can view own handovers"
  ON handovers FOR SELECT
  TO authenticated
  USING (
    partner_name = (SELECT company FROM profiles WHERE id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'partner'
    )
  );

-- Only admins can create handovers
CREATE POLICY "SMP admins can create handovers"
  ON handovers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'smp_admin'
    )
  );

-- Admins can update handovers
CREATE POLICY "SMP admins can update handovers"
  ON handovers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'smp_admin'
    )
  );

-- Only admins can delete handovers
CREATE POLICY "SMP admins can delete handovers"
  ON handovers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'smp_admin'
    )
  );

-- ============================================
-- AUDIT LOGS POLICIES (if table exists)
-- ============================================
-- Uncomment if you have an audit_logs table:
/*
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins and security officers can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('smp_admin', 'security_officer')
    )
  );

-- System can insert audit logs (service role)
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No one can update or delete audit logs (immutable)
-- (No UPDATE or DELETE policies)
*/

-- ============================================
-- STORAGE BUCKET POLICIES
-- ============================================
-- Run these in Storage > Policies in Supabase Dashboard:
/*
-- Allow authenticated users to upload to driver-documents bucket
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'driver-documents');

-- Allow SMP team to view documents
CREATE POLICY "SMP team can view documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'driver-documents' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('smp_admin', 'smp_agent', 'security_officer')
    )
  );

-- Allow drivers to view their own documents
CREATE POLICY "Drivers can view own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'driver-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT d.id::text FROM drivers d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Only admins can delete documents
CREATE POLICY "Admins can delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'driver-documents' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_admin'
    )
  );
*/
