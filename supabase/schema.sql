-- ============================================
-- SMP Green Rides Africa - Database Schema
-- ============================================
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('smp_admin', 'smp_agent', 'partner');

-- Driver pipeline status
CREATE TYPE driver_status AS ENUM (
  'sourced',
  'screening',
  'qualified',
  'onboarding',
  'handed_over',
  'rejected'
);

-- Source channels for driver acquisition
CREATE TYPE source_channel AS ENUM (
  'social_media',
  'referral',
  'roadshow',
  'boda_stage',
  'whatsapp',
  'other'
);

-- Document types
CREATE TYPE document_type AS ENUM (
  'national_id',
  'driving_permit',
  'photo',
  'other'
);

-- Handover status
CREATE TYPE handover_status AS ENUM (
  'scheduled',
  'completed',
  'cancelled'
);

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'smp_agent',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drivers table
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  national_id TEXT,
  driving_permit_number TEXT,
  location TEXT,
  source_channel source_channel NOT NULL DEFAULT 'other',
  referred_by UUID REFERENCES drivers(id),
  status driver_status NOT NULL DEFAULT 'sourced',
  screening_score INTEGER CHECK (screening_score >= 0 AND screening_score <= 100),
  assigned_agent_id UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Driver documents table
CREATE TABLE driver_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Screening responses table
CREATE TABLE screening_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  response TEXT NOT NULL,
  score_contribution INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Status history table (audit trail)
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  from_status driver_status,
  to_status driver_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  notes TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Handovers table
CREATE TABLE handovers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  location TEXT,
  driver_ids UUID[] NOT NULL DEFAULT '{}',
  status handover_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Drivers indexes
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_source_channel ON drivers(source_channel);
CREATE INDEX idx_drivers_assigned_agent ON drivers(assigned_agent_id);
CREATE INDEX idx_drivers_created_at ON drivers(created_at DESC);
CREATE INDEX idx_drivers_phone ON drivers(phone);

-- Driver documents indexes
CREATE INDEX idx_driver_documents_driver_id ON driver_documents(driver_id);
CREATE INDEX idx_driver_documents_type ON driver_documents(document_type);

-- Status history indexes
CREATE INDEX idx_status_history_driver_id ON status_history(driver_id);
CREATE INDEX idx_status_history_changed_at ON status_history(changed_at DESC);

-- Handovers indexes
CREATE INDEX idx_handovers_scheduled_date ON handovers(scheduled_date);
CREATE INDEX idx_handovers_status ON handovers(status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log status changes
CREATE OR REPLACE FUNCTION log_driver_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO status_history (driver_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate screening score
CREATE OR REPLACE FUNCTION calculate_screening_score(p_driver_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_score INTEGER;
BEGIN
  SELECT COALESCE(SUM(score_contribution), 0)
  INTO total_score
  FROM screening_responses
  WHERE driver_id = p_driver_id;

  RETURN LEAST(total_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'smp_agent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Log status changes
CREATE TRIGGER log_driver_status_change_trigger
  AFTER UPDATE ON drivers
  FOR EACH ROW
  EXECUTE FUNCTION log_driver_status_change();

-- Handle new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE handovers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - Profiles
-- ============================================

-- Users can view all profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS POLICIES - Drivers
-- ============================================

-- All authenticated users can view drivers
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

-- SMP admins can update any driver, agents can update assigned drivers
CREATE POLICY "SMP team can update drivers"
  ON drivers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (
        role = 'smp_admin'
        OR (role = 'smp_agent' AND drivers.assigned_agent_id = auth.uid())
      )
    )
  );

-- Only SMP admins can delete drivers
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
-- RLS POLICIES - Driver Documents
-- ============================================

-- Authenticated users can view documents
CREATE POLICY "Authenticated users can view documents"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (true);

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

-- SMP team can update documents
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

-- SMP admins can delete documents
CREATE POLICY "SMP admins can delete documents"
  ON driver_documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'smp_admin'
    )
  );

-- ============================================
-- RLS POLICIES - Screening Responses
-- ============================================

-- Authenticated users can view screening responses
CREATE POLICY "Authenticated users can view screening"
  ON screening_responses FOR SELECT
  TO authenticated
  USING (true);

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

-- ============================================
-- RLS POLICIES - Status History
-- ============================================

-- Authenticated users can view status history
CREATE POLICY "Authenticated users can view history"
  ON status_history FOR SELECT
  TO authenticated
  USING (true);

-- Status history is inserted via trigger, allow for authenticated
CREATE POLICY "System can insert history"
  ON status_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES - Handovers
-- ============================================

-- Authenticated users can view handovers
CREATE POLICY "Authenticated users can view handovers"
  ON handovers FOR SELECT
  TO authenticated
  USING (true);

-- SMP admins can manage handovers
CREATE POLICY "SMP admins can insert handovers"
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

-- ============================================
-- STORAGE BUCKET (Run separately in Storage settings)
-- ============================================
-- Create a bucket called 'driver-documents' in Supabase Storage
-- with the following policy:
--
-- INSERT: authenticated users can upload
-- SELECT: authenticated users can view
-- DELETE: only admins

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment below to insert sample data after creating your first user

/*
-- Insert sample drivers
INSERT INTO drivers (first_name, last_name, phone, location, source_channel, status, screening_score) VALUES
  ('John', 'Okello', '+256701234567', 'Kampala Central', 'boda_stage', 'sourced', NULL),
  ('Grace', 'Nakimuli', '+256702345678', 'Ntinda', 'referral', 'screening', 75),
  ('Peter', 'Wasswa', '+256703456789', 'Kawempe', 'social_media', 'qualified', 85),
  ('Sarah', 'Namubiru', '+256704567890', 'Makindye', 'roadshow', 'onboarding', 90),
  ('David', 'Ochieng', '+256705678901', 'Rubaga', 'whatsapp', 'handed_over', 88);
*/

-- ============================================
-- VIEWS (Optional - for easier querying)
-- ============================================

-- View for driver statistics by status
CREATE OR REPLACE VIEW driver_stats AS
SELECT
  status,
  COUNT(*) as count,
  AVG(screening_score) as avg_score
FROM drivers
GROUP BY status;

-- View for monthly acquisition targets
CREATE OR REPLACE VIEW monthly_acquisitions AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) FILTER (WHERE status = 'handed_over') as handed_over,
  COUNT(*) as total_sourced
FROM drivers
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
