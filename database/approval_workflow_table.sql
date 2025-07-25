-- Updated approval_workflow table with manager_level
-- Drop existing table if exists (be careful in production!)
-- DROP TABLE IF EXISTS approval_workflow CASCADE;

-- Create approval_workflow table
CREATE TABLE approval_workflow (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  manager_id UUID REFERENCES users(id) ON DELETE CASCADE,
  manager_name VARCHAR(255) NOT NULL,
  manager_level VARCHAR(1) NOT NULL CHECK (manager_level IN ('A', 'B', 'C')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT approval_workflow_unique_level UNIQUE (request_id, level),
  CONSTRAINT approval_workflow_manager_level_order 
    CHECK (
      (level = 1 AND manager_level = 'A') OR
      (level = 2 AND manager_level = 'B') OR  
      (level = 3 AND manager_level = 'C')
    )
);

-- Create indexes for better performance
CREATE INDEX idx_approval_workflow_request_id ON approval_workflow(request_id);
CREATE INDEX idx_approval_workflow_manager_id ON approval_workflow(manager_id);
CREATE INDEX idx_approval_workflow_level ON approval_workflow(level);
CREATE INDEX idx_approval_workflow_status ON approval_workflow(status);
CREATE INDEX idx_approval_workflow_manager_level ON approval_workflow(manager_level);

-- Enable RLS (Row Level Security)
ALTER TABLE approval_workflow ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view approval workflows for their own requests
CREATE POLICY "Users can view own request approvals" ON approval_workflow
  FOR SELECT USING (
    request_id IN (
      SELECT id FROM requests WHERE user_id = (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- Managers can view approval workflows for requests at their level
CREATE POLICY "Managers can view relevant approvals" ON approval_workflow
  FOR SELECT USING (
    manager_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid() AND role = 'manager'
    )
  );

-- Managers can update their own approval status
CREATE POLICY "Managers can update own approvals" ON approval_workflow
  FOR UPDATE USING (
    manager_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid() AND role = 'manager'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_approval_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_approval_workflow_updated_at
  BEFORE UPDATE ON approval_workflow
  FOR EACH ROW
  EXECUTE FUNCTION update_approval_workflow_updated_at(); 