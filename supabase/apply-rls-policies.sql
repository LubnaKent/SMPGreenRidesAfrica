-- ============================================
-- APPLY RLS POLICIES - Run this in Supabase SQL Editor
-- This script will drop existing policies and create new secure ones
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Security officers can view profiles" ON profiles;

-- Drivers policies
DROP POLICY IF EXISTS "Authenticated users can view drivers" ON drivers;
DROP POLICY IF EXISTS "Admins can view all drivers" ON drivers;
DROP POLICY IF EXISTS "Agents can view all drivers" ON drivers;
DROP POLICY IF EXISTS "Security officers can view drivers" ON drivers;
DROP POLICY IF EXISTS "Partners can view handed over drivers" ON drivers;
DROP POLICY IF EXISTS "Drivers can view own record" ON drivers;
DROP POLICY IF EXISTS "SMP team can insert drivers" ON drivers;
DROP POLICY IF EXISTS "SMP team can update drivers" ON drivers;
DROP POLICY IF EXISTS "Security can update driver verification" ON drivers;
DROP POLICY IF EXISTS "SMP admins can delete drivers" ON drivers;

-- Driver documents policies
DROP POLICY IF EXISTS "Authenticated users can view documents" ON driver_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON driver_documents;
DROP POLICY IF EXISTS "Agents can view documents" ON driver_documents;
DROP POLICY IF EXISTS "Security can view documents" ON driver_documents;
DROP POLICY IF EXISTS "Partners can view handed over driver documents" ON driver_documents;
DROP POLICY IF EXISTS "Drivers can view own documents" ON driver_documents;
DROP POLICY IF EXISTS "SMP team can insert documents" ON driver_documents;
DROP POLICY IF EXISTS "Drivers can insert own documents" ON driver_documents;
DROP POLICY IF EXISTS "SMP team can update documents" ON driver_documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON driver_documents;

-- Screening responses policies
DROP POLICY IF EXISTS "Authenticated users can view screening" ON screening_responses;
DROP POLICY IF EXISTS "SMP team can view screening" ON screening_responses;
DROP POLICY IF EXISTS "Security can view screening" ON screening_responses;
DROP POLICY IF EXISTS "Drivers can view own screening" ON screening_responses;
DROP POLICY IF EXISTS "SMP team can insert screening" ON screening_responses;
DROP POLICY IF EXISTS "Drivers can insert own screening" ON screening_responses;

-- Status history policies
DROP POLICY IF EXISTS "Authenticated users can view history" ON status_history;
DROP POLICY IF EXISTS "SMP team can view history" ON status_history;
DROP POLICY IF EXISTS "Security can view history" ON status_history;
DROP POLICY IF EXISTS "Drivers can view own history" ON status_history;
DROP POLICY IF EXISTS "SMP team can insert history" ON status_history;

-- Handovers policies
DROP POLICY IF EXISTS "Authenticated users can view handovers" ON handovers;
DROP POLICY IF EXISTS "Admins can view all handovers" ON handovers;
DROP POLICY IF EXISTS "Agents can view handovers" ON handovers;
DROP POLICY IF EXISTS "Partners can view own handovers" ON handovers;
DROP POLICY IF EXISTS "SMP admins can manage handovers" ON handovers;
DROP POLICY IF EXISTS "SMP admins can create handovers" ON handovers;
DROP POLICY IF EXISTS "SMP admins can update handovers" ON handovers;
DROP POLICY IF EXISTS "SMP admins can delete handovers" ON handovers;

-- ============================================
-- STEP 2: ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE handovers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE HELPER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================
-- STEP 4: PROFILES POLICIES
-- ============================================

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_admin'
    )
  );

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
-- STEP 5: DRIVERS POLICIES (ROLE-BASED)
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

-- SMP Agents can view all drivers
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

-- Drivers can view their own record
CREATE POLICY "Drivers can view own record"
  ON drivers FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'driver'
    )
  );

-- SMP team can insert drivers
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
-- STEP 6: DRIVER DOCUMENTS POLICIES
-- ============================================

CREATE POLICY "Admins can view all documents"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_admin'
    )
  );

CREATE POLICY "Agents can view documents"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_agent'
    )
  );

CREATE POLICY "Security can view documents"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'security_officer'
    )
  );

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
-- STEP 7: SCREENING RESPONSES POLICIES
-- ============================================

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

CREATE POLICY "Security can view screening"
  ON screening_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'security_officer'
    )
  );

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
-- STEP 8: STATUS HISTORY POLICIES
-- ============================================

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

CREATE POLICY "Security can view history"
  ON status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'security_officer'
    )
  );

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
-- STEP 9: HANDOVERS POLICIES
-- ============================================

CREATE POLICY "Admins can view all handovers"
  ON handovers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_admin'
    )
  );

CREATE POLICY "Agents can view handovers"
  ON handovers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_agent'
    )
  );

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
-- DONE! All RLS policies have been applied.
-- ============================================
