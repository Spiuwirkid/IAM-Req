-- Users table to store user profiles linked to Supabase Auth
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('staff', 'manager', 'itadmin')),
  manager_level VARCHAR(1) CHECK (manager_level IN ('A', 'B', 'C')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT users_manager_level_check 
    CHECK (
      (role = 'manager' AND manager_level IS NOT NULL) OR 
      (role != 'manager' AND manager_level IS NULL)
    )
);

-- Create indexes for better performance
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_manager_level ON users(manager_level);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = auth_id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Only authenticated users can read other users (for approval workflow)
CREATE POLICY "Authenticated users can view other users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion (you can run this manually to create test accounts)
/*
-- Staff User
INSERT INTO users (auth_id, email, name, role) VALUES 
  ('staff-auth-id-here', 'staff@company.com', 'John Doe', 'staff');

-- Manager A
INSERT INTO users (auth_id, email, name, role, manager_level) VALUES 
  ('manager-a-auth-id-here', 'manager.a@company.com', 'Alice Manager', 'manager', 'A');

-- Manager B
INSERT INTO users (auth_id, email, name, role, manager_level) VALUES 
  ('manager-b-auth-id-here', 'manager.b@company.com', 'Bob Manager', 'manager', 'B');

-- Manager C
INSERT INTO users (auth_id, email, name, role, manager_level) VALUES 
  ('manager-c-auth-id-here', 'manager.c@company.com', 'Carol Manager', 'manager', 'C');

-- IT Admin
INSERT INTO users (auth_id, email, name, role) VALUES 
  ('itadmin-auth-id-here', 'itadmin@company.com', 'David Admin', 'itadmin');
*/ 