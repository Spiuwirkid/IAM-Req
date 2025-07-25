-- Database Schema for IAM Request System with Supabase Auth Integration
-- This schema works with Supabase Authentication (no custom users table needed)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- APPLICATIONS TABLE
-- =====================================================
CREATE TABLE applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  type_level VARCHAR(20) NOT NULL CHECK (type_level IN ('Leveling', 'No leveling')),
  managers TEXT[] DEFAULT '{}', -- Array of manager names
  logo VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REQUESTS TABLE 
-- =====================================================
CREATE TABLE requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL, -- From Supabase Auth
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  application_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  current_level INTEGER DEFAULT 1,
  total_levels INTEGER DEFAULT 1,
  business_justification TEXT NOT NULL,
  requested_access_level VARCHAR(100) NOT NULL,
  requested_duration VARCHAR(100) NOT NULL,
  approved_by TEXT[] DEFAULT '{}', -- Array of manager names who approved
  rejected_by VARCHAR(255),
  rejection_reason TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- APPROVAL WORKFLOW TABLE
-- =====================================================
CREATE TABLE approval_workflow (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  manager_id VARCHAR(255) NOT NULL, -- manager_a, manager_b, manager_c, itadmin_1
  manager_name VARCHAR(255) NOT NULL, -- Manager A, Manager B, Manager C, IT Admin
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(request_id, level, manager_id)
);

-- =====================================================
-- ACCESS PERMISSIONS TABLE (Optional - for audit)
-- =====================================================
CREATE TABLE access_permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  application_id UUID NOT NULL REFERENCES applications(id),
  access_level VARCHAR(100) NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  granted_by VARCHAR(255) NOT NULL, -- Manager who gave final approval
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AUDIT LOG TABLE (Optional - for tracking)
-- =====================================================
CREATE TABLE audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL, -- 'request_created', 'request_approved', 'request_rejected', etc.
  resource_type VARCHAR(50) NOT NULL, -- 'request', 'application', etc.
  resource_id UUID NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_application_id ON requests(application_id);
CREATE INDEX idx_requests_created_at ON requests(created_at);

CREATE INDEX idx_approval_workflow_request_id ON approval_workflow(request_id);
CREATE INDEX idx_approval_workflow_manager ON approval_workflow(manager_id, status);
CREATE INDEX idx_approval_workflow_level ON approval_workflow(level);

CREATE INDEX idx_access_permissions_user_id ON access_permissions(user_id);
CREATE INDEX idx_access_permissions_application_id ON access_permissions(application_id);
CREATE INDEX idx_access_permissions_active ON access_permissions(is_active);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_workflow_updated_at BEFORE UPDATE ON approval_workflow
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_permissions_updated_at BEFORE UPDATE ON access_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Applications: Everyone can read active applications
CREATE POLICY "Everyone can view active applications" ON applications
  FOR SELECT USING (is_active = true);

-- Applications: Only authenticated users can manage (will be handled by app logic)
CREATE POLICY "Authenticated users can manage applications" ON applications
  FOR ALL USING (auth.role() = 'authenticated');

-- Requests: Users can view their own requests
CREATE POLICY "Users can view own requests" ON requests
  FOR SELECT USING (true); -- We'll handle filtering in application logic

-- Requests: Users can create requests
CREATE POLICY "Users can create requests" ON requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Requests: Users can update their own pending requests
CREATE POLICY "Users can update own pending requests" ON requests
  FOR UPDATE USING (true); -- We'll handle authorization in application logic

-- Approval workflow: Everyone can read
CREATE POLICY "Everyone can view approval workflow" ON approval_workflow
  FOR SELECT USING (true);

-- Approval workflow: Can insert/update
CREATE POLICY "Can manage approval workflow" ON approval_workflow
  FOR ALL USING (auth.role() = 'authenticated');

-- Access permissions: Users can view their own permissions
CREATE POLICY "Users can view own permissions" ON access_permissions
  FOR SELECT USING (true);

-- Access permissions: Can manage permissions
CREATE POLICY "Can manage permissions" ON access_permissions
  FOR ALL USING (auth.role() = 'authenticated');

-- Audit log: Can view and insert audit logs
CREATE POLICY "Can manage audit logs" ON audit_log
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- SAMPLE APPLICATIONS DATA
-- =====================================================
INSERT INTO applications (name, description, category, type_level, managers, logo) VALUES 
('GNS3', 'Network simulation and virtualization platform for network engineers', 'Network Tools', 'Leveling', ARRAY['Manager A', 'Manager B', 'Manager C'], '/app-logo/gns3.png'),
('VMware ESXi', 'Virtualization platform for enterprise infrastructure', 'Virtualization', 'Leveling', ARRAY['Manager A', 'Manager B', 'Manager C'], '/app-logo/vmware-esxi.png'),
('NextCloud', 'Self-hosted file sharing and collaboration platform', 'File Sharing', 'No leveling', ARRAY['IT Admin'], '/app-logo/nextcloud.png'),
('Docker', 'Containerization platform for application deployment', 'Development Tools', 'Leveling', ARRAY['Manager A', 'Manager B', 'Manager C'], '/app-logo/docker.png'),
('Kubernetes', 'Container orchestration platform', 'Development Tools', 'Leveling', ARRAY['Manager A', 'Manager B', 'Manager C'], '/app-logo/kubernetes.png'),
('Grafana', 'Monitoring and observability platform', 'Monitoring', 'No leveling', ARRAY['IT Admin'], '/app-logo/grafana.png'),
('Slack', 'Team communication and collaboration tool', 'Communication', 'No leveling', ARRAY['IT Admin'], '/app-logo/slack.png'),
('Jira', 'Project management and issue tracking', 'Project Management', 'Leveling', ARRAY['Manager A', 'Manager B', 'Manager C'], '/app-logo/jira.png');

-- =====================================================
-- VIEWS FOR REPORTING (Optional)
-- =====================================================

-- Request summary view
CREATE VIEW v_request_summary AS
SELECT 
  r.id,
  r.user_name,
  r.user_email,
  r.application_name,
  r.status,
  r.current_level,
  r.total_levels,
  r.business_justification,
  r.requested_access_level,
  r.requested_duration,
  CASE 
    WHEN r.status = 'approved' THEN 100.0
    WHEN r.status = 'rejected' THEN 0.0
    ELSE ROUND((r.current_level - 1) * 100.0 / NULLIF(r.total_levels, 0), 1)
  END as progress_percentage,
  array_length(r.approved_by, 1) as approvals_count,
  r.created_at,
  r.updated_at
FROM requests r;

-- Application usage view
CREATE VIEW v_application_usage AS
SELECT 
  a.name as application_name,
  a.category,
  a.type_level,
  COUNT(r.id) as total_requests,
  COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN r.status = 'approved' THEN 1 END) as approved_requests,
  COUNT(CASE WHEN r.status = 'rejected' THEN 1 END) as rejected_requests,
  ROUND(
    COUNT(CASE WHEN r.status = 'approved' THEN 1 END) * 100.0 / 
    NULLIF(COUNT(r.id), 0), 1
  ) as approval_rate
FROM applications a
LEFT JOIN requests r ON a.id = r.application_id
WHERE a.is_active = true
GROUP BY a.id, a.name, a.category, a.type_level
ORDER BY total_requests DESC;

-- Manager workload view
CREATE VIEW v_manager_workload AS
SELECT 
  aw.manager_name,
  COUNT(*) as total_assignments,
  COUNT(CASE WHEN aw.status = 'pending' THEN 1 END) as pending_approvals,
  COUNT(CASE WHEN aw.status = 'approved' THEN 1 END) as completed_approvals,
  COUNT(CASE WHEN aw.status = 'rejected' THEN 1 END) as rejected_requests,
  ROUND(
    AVG(EXTRACT(EPOCH FROM (COALESCE(aw.approved_at, aw.rejected_at, NOW()) - aw.created_at)) / 3600), 1
  ) as avg_response_time_hours
FROM approval_workflow aw
GROUP BY aw.manager_name
ORDER BY pending_approvals DESC, total_assignments DESC; 

-- =====================================================
-- SUPABASE FUNCTIONS FOR APPROVAL WORKFLOW
-- =====================================================

-- Function to approve request sequentially
CREATE OR REPLACE FUNCTION approve_request_sequential(
  p_request_id UUID,
  p_manager_name VARCHAR(255),
  p_approval_comments TEXT DEFAULT ''
)
RETURNS JSON AS $$
DECLARE
  v_request RECORD;
  v_approval RECORD;
  v_manager_level INTEGER;
  v_next_level INTEGER;
  v_result JSON;
BEGIN
  -- Get the current request
  SELECT * INTO v_request 
  FROM requests 
  WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found');
  END IF;
  
  -- Determine manager level based on manager name
  CASE 
    WHEN p_manager_name LIKE '%Manager A%' THEN v_manager_level := 1;
    WHEN p_manager_name LIKE '%Manager B%' THEN v_manager_level := 2;
    WHEN p_manager_name LIKE '%Manager C%' THEN v_manager_level := 3;
    ELSE v_manager_level := 1;
  END CASE;
  
  -- Check if it's this manager's turn to approve
  IF v_request.current_level != v_manager_level THEN
    RETURN json_build_object(
      'success', false, 
      'error', format('Not your turn to approve. Current level: %s, Your level: %s', v_request.current_level, v_manager_level)
    );
  END IF;
  
  -- Get the current approval record
  SELECT * INTO v_approval 
  FROM approval_workflow 
  WHERE request_id = p_request_id AND level = v_manager_level;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Approval record not found');
  END IF;
  
  -- Update the approval status
  UPDATE approval_workflow 
  SET 
    status = 'approved',
    comments = p_approval_comments,
    approved_at = NOW(),
    updated_at = NOW()
  WHERE id = v_approval.id;
  
  -- Calculate next level
  v_next_level := v_manager_level + 1;
  
  -- Update request status based on approval level
  IF v_manager_level >= v_request.total_levels THEN
    -- All levels approved - request completed
    UPDATE requests 
    SET 
      status = 'approved',
      current_level = v_next_level,
      approved_by = array_append(approved_by, p_manager_name),
      approved_at = NOW(),
      updated_at = NOW()
    WHERE id = p_request_id;
    
    -- Log the approval
    INSERT INTO audit_log (user_id, user_email, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      auth.jwt() ->> 'email',
      'request_approved',
      'request',
      p_request_id,
      json_build_object(
        'manager_name', p_manager_name,
        'level', v_manager_level,
        'comments', p_approval_comments,
        'final_approval', true
      )
    );
    
    v_result := json_build_object(
      'success', true,
      'message', 'Request fully approved',
      'status', 'approved',
      'level', v_manager_level
    );
  ELSE
    -- Move to next approval level
    UPDATE requests 
    SET 
      current_level = v_next_level,
      approved_by = array_append(approved_by, p_manager_name),
      updated_at = NOW()
    WHERE id = p_request_id;
    
    -- Log the approval
    INSERT INTO audit_log (user_id, user_email, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      auth.jwt() ->> 'email',
      'request_approved',
      'request',
      p_request_id,
      json_build_object(
        'manager_name', p_manager_name,
        'level', v_manager_level,
        'comments', p_approval_comments,
        'next_level', v_next_level
      )
    );
    
    v_result := json_build_object(
      'success', true,
      'message', format('Approved by %s, moving to level %s', p_manager_name, v_next_level),
      'status', 'pending',
      'level', v_manager_level,
      'next_level', v_next_level
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject request (immediately stops workflow)
CREATE OR REPLACE FUNCTION reject_request_sequential(
  p_request_id UUID,
  p_manager_name VARCHAR(255),
  p_rejection_reason TEXT DEFAULT ''
)
RETURNS JSON AS $$
DECLARE
  v_request RECORD;
  v_approval RECORD;
  v_manager_level INTEGER;
  v_result JSON;
BEGIN
  -- Get the current request
  SELECT * INTO v_request 
  FROM requests 
  WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found');
  END IF;
  
  -- Determine manager level based on manager name
  CASE 
    WHEN p_manager_name LIKE '%Manager A%' THEN v_manager_level := 1;
    WHEN p_manager_name LIKE '%Manager B%' THEN v_manager_level := 2;
    WHEN p_manager_name LIKE '%Manager C%' THEN v_manager_level := 3;
    ELSE v_manager_level := 1;
  END CASE;
  
  -- Check if it's this manager's turn to approve/reject
  IF v_request.current_level != v_manager_level THEN
    RETURN json_build_object(
      'success', false, 
      'error', format('Not your turn to reject. Current level: %s, Your level: %s', v_request.current_level, v_manager_level)
    );
  END IF;
  
  -- Get the current approval record
  SELECT * INTO v_approval 
  FROM approval_workflow 
  WHERE request_id = p_request_id AND level = v_manager_level;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Approval record not found');
  END IF;
  
  -- Update the approval status to rejected
  UPDATE approval_workflow 
  SET 
    status = 'rejected',
    comments = p_rejection_reason,
    rejected_at = NOW(),
    updated_at = NOW()
  WHERE id = v_approval.id;
  
  -- Update request status to rejected
  UPDATE requests 
  SET 
    status = 'rejected',
    rejected_by = p_manager_name,
    rejection_reason = p_rejection_reason,
    rejected_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Log the rejection
  INSERT INTO audit_log (user_id, user_email, action, resource_type, resource_id, details)
  VALUES (
    auth.uid(),
    auth.jwt() ->> 'email',
    'request_rejected',
    'request',
    p_request_id,
    json_build_object(
      'manager_name', p_manager_name,
      'level', v_manager_level,
      'reason', p_rejection_reason
    )
  );
  
  v_result := json_build_object(
    'success', true,
    'message', format('Request rejected by %s', p_manager_name),
    'status', 'rejected',
    'level', v_manager_level,
    'reason', p_rejection_reason
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create request with approval workflow
CREATE OR REPLACE FUNCTION create_request_with_workflow(
  p_user_id VARCHAR(255),
  p_user_name VARCHAR(255),
  p_user_email VARCHAR(255),
  p_application_id UUID,
  p_application_name VARCHAR(255),
  p_business_justification TEXT,
  p_requested_access_level VARCHAR(100),
  p_requested_duration VARCHAR(100)
)
RETURNS JSON AS $$
DECLARE
  new_request_id UUID;
  app_record RECORD;
  manager_level INTEGER;
  result JSON;
BEGIN
  -- Get application details
  SELECT * INTO app_record 
  FROM applications 
  WHERE id = p_application_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Application not found');
  END IF;
  
  -- Create the request
  INSERT INTO requests (
    user_id, user_name, user_email, application_id, application_name,
    business_justification, requested_access_level, requested_duration,
    total_levels, current_level
  ) VALUES (
    p_user_id, p_user_name, p_user_email, p_application_id, p_application_name,
    p_business_justification, p_requested_access_level, p_requested_duration,
    CASE WHEN app_record.type_level = 'Leveling' THEN 3 ELSE 1 END,
    1
  ) RETURNING id INTO new_request_id;
  
  -- Create approval workflow records
  IF app_record.type_level = 'Leveling' THEN
    -- Leveling application: Manager A -> Manager B -> Manager C
    INSERT INTO approval_workflow (request_id, level, manager_id, manager_name, status) VALUES
      (new_request_id, 1, 'manager_a', 'Manager A', 'pending'),
      (new_request_id, 2, 'manager_b', 'Manager B', 'pending'),
      (new_request_id, 3, 'manager_c', 'Manager C', 'pending');
  ELSE
    -- No leveling application: IT Admin only
    INSERT INTO approval_workflow (request_id, level, manager_id, manager_name, status) VALUES
      (new_request_id, 1, 'itadmin', 'IT Admin', 'pending');
  END IF;
  
  -- Log the request creation
  INSERT INTO audit_log (user_id, user_email, action, resource_type, resource_id, details)
  VALUES (
    p_user_id,
    p_user_email,
    'request_created',
    'request',
    new_request_id,
    json_build_object(
      'application_name', p_application_name,
      'access_level', p_requested_access_level,
      'duration', p_requested_duration,
      'type_level', app_record.type_level
    )
  );
  
  result := json_build_object(
    'success', true,
    'request_id', new_request_id,
    'message', 'Request created successfully',
    'total_levels', CASE WHEN app_record.type_level = 'Leveling' THEN 3 ELSE 1 END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 

-- =====================================================
-- SAMPLE REQUEST DATA WITH APPROVAL WORKFLOW
-- =====================================================

-- Sample requests with real user data
INSERT INTO requests (
  id, user_id, user_name, user_email, application_id, application_name,
  business_justification, requested_access_level, requested_duration,
  status, current_level, total_levels, created_at
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'staff_user_1',
  'John Doe',
  'john.doe@company.com',
  (SELECT id FROM applications WHERE name = 'NextCloud'),
  'NextCloud',
  'Need secure file sharing access for team collaboration and document management for the upcoming project deliverables.',
  'Full Access',
  '6 months',
  'pending',
  1,
  3,
  NOW() - INTERVAL '2 days'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'staff_user_2',
  'Jane Smith',
  'jane.smith@company.com',
  (SELECT id FROM applications WHERE name = 'GNS3'),
  'GNS3',
  'Required for network simulation and lab environment setup for infrastructure testing and development.',
  'Admin Access',
  '12 months',
  'pending',
  1,
  3,
  NOW() - INTERVAL '1 day'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'staff_user_3',
  'Bob Wilson',
  'bob.wilson@company.com',
  (SELECT id FROM applications WHERE name = 'Slack'),
  'Slack',
  'Need access for team communication and project coordination with external stakeholders.',
  'Standard Access',
  'Permanent',
  'pending',
  1,
  1,
  NOW() - INTERVAL '3 hours'
);

-- Sample approval workflow records
INSERT INTO approval_workflow (
  request_id, level, manager_id, manager_name, status, created_at
) VALUES 
-- NextCloud request (Leveling - 3 levels)
('550e8400-e29b-41d4-a716-446655440001', 1, 'manager_a', 'Manager A', 'pending', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440001', 2, 'manager_b', 'Manager B', 'pending', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440001', 3, 'manager_c', 'Manager C', 'pending', NOW() - INTERVAL '2 days'),

-- GNS3 request (Leveling - 3 levels)
('550e8400-e29b-41d4-a716-446655440002', 1, 'manager_a', 'Manager A', 'pending', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440002', 2, 'manager_b', 'Manager B', 'pending', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440002', 3, 'manager_c', 'Manager C', 'pending', NOW() - INTERVAL '1 day'),

-- Slack request (No leveling - 1 level)
('550e8400-e29b-41d4-a716-446655440003', 1, 'itadmin', 'IT Admin', 'pending', NOW() - INTERVAL '3 hours'); 