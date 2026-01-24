-- ============================================
-- Row Level Security Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE handovers ENABLE ROW LEVEL SECURITY;

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

-- Users can update their own profile
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

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'smp_admin'
    )
  );

-- ============================================
-- DRIVERS POLICIES
-- ============================================

-- Authenticated users can view drivers
CREATE POLICY "Authenticated users can view drivers"
  ON drivers FOR SELECT
  TO authenticated
  USING (true);

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
-- DRIVER DOCUMENTS POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view documents"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (true);

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

CREATE POLICY "SMP team can update documents"
  ON driver_documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('smp_admin', 'smp_agent')
    )
  );

-- ============================================
-- SCREENING RESPONSES POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view screening"
  ON screening_responses FOR SELECT
  TO authenticated
  USING (true);

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

-- ============================================
-- STATUS HISTORY POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view history"
  ON status_history FOR SELECT
  TO authenticated
  USING (true);

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
-- HANDOVERS POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view handovers"
  ON handovers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "SMP admins can manage handovers"
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
