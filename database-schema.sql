-- IAM Request System Database Schema
-- Clean schema without sample data

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- APPLICATIONS TABLE
-- Stores all applications that can be requested
-- ============================================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    type_level VARCHAR(20) NOT NULL DEFAULT 'No leveling' CHECK (type_level IN ('Leveling', 'No leveling')),
    managers TEXT[] DEFAULT '{}', -- Array of manager names for leveling apps
    logo TEXT DEFAULT '/app-logo/default.png',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- USERS TABLE
-- Stores user information (can be extended for full user management)
-- ============================================================
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY, -- Can be from auth system
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'manager', 'itadmin')),
    department VARCHAR(100),
    manager_id VARCHAR(255) REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- REQUESTS TABLE
-- Stores all access requests from staff
-- ============================================================
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    application_name VARCHAR(255) NOT NULL,
    
    -- Request details
    business_justification TEXT NOT NULL,
    requested_access_level VARCHAR(100) DEFAULT 'Standard User',
    requested_duration VARCHAR(100) DEFAULT '1 year',
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    current_level INTEGER DEFAULT 1,
    total_levels INTEGER DEFAULT 1,
    
    -- Approval tracking
    approved_by TEXT[], -- Array of manager names who approved
    rejected_by VARCHAR(255), -- Manager who rejected
    rejection_reason TEXT,
    
    -- Timestamps
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    rejected_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- APPROVAL_WORKFLOW TABLE
-- Stores approval steps for each request
-- ============================================================
CREATE TABLE approval_workflow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    
    -- Approval level info
    level INTEGER NOT NULL,
    manager_id VARCHAR(255) NOT NULL, -- Can reference users table
    manager_name VARCHAR(255) NOT NULL,
    
    -- Status and result
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
    comments TEXT,
    
    -- Timestamps
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    rejected_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique level per request
    UNIQUE(request_id, level)
);

-- ============================================================
-- ACCESS_PERMISSIONS TABLE
-- Stores granted permissions after approval
-- ============================================================
CREATE TABLE access_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    
    -- Permission details
    access_level VARCHAR(100) NOT NULL,
    granted_duration VARCHAR(100) NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Granted by
    granted_by VARCHAR(255) NOT NULL, -- IT Admin who granted access
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Audit
    revoked_by VARCHAR(255),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoke_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- AUDIT_LOG TABLE
-- Stores all system activities for auditing
-- ============================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Action details
    action VARCHAR(100) NOT NULL, -- 'request_created', 'request_approved', 'access_granted', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'request', 'application', 'user', etc.
    entity_id VARCHAR(255) NOT NULL,
    
    -- User who performed action
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    
    -- Details
    description TEXT,
    old_data JSONB,
    new_data JSONB,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES for better performance
-- ============================================================

-- Applications indexes
CREATE INDEX idx_applications_category ON applications(category);
CREATE INDEX idx_applications_type_level ON applications(type_level);
CREATE INDEX idx_applications_active ON applications(is_active);

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_manager_id ON users(manager_id);

-- Requests indexes
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_requests_application_id ON requests(application_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created_at ON requests(created_at);

-- Approval workflow indexes
CREATE INDEX idx_approval_workflow_request_id ON approval_workflow(request_id);
CREATE INDEX idx_approval_workflow_level ON approval_workflow(level);
CREATE INDEX idx_approval_workflow_manager_id ON approval_workflow(manager_id);
CREATE INDEX idx_approval_workflow_status ON approval_workflow(status);

-- Access permissions indexes
CREATE INDEX idx_access_permissions_user_id ON access_permissions(user_id);
CREATE INDEX idx_access_permissions_application_id ON access_permissions(application_id);
CREATE INDEX idx_access_permissions_active ON access_permissions(is_active);
CREATE INDEX idx_access_permissions_expires_at ON access_permissions(expires_at);

-- Audit log indexes
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_entity_id ON audit_log(entity_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at 
    BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_workflow_updated_at 
    BEFORE UPDATE ON approval_workflow
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_permissions_updated_at 
    BEFORE UPDATE ON access_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VIEWS for common queries
-- ============================================================

-- View for request details with approval status
CREATE VIEW request_details AS
SELECT 
    r.*,
    a.name as app_name,
    a.category as app_category,
    a.type_level as app_type_level,
    a.managers as app_managers,
    -- Count approvals
    (SELECT COUNT(*) FROM approval_workflow aw WHERE aw.request_id = r.id AND aw.status = 'approved') as approved_count,
    (SELECT COUNT(*) FROM approval_workflow aw WHERE aw.request_id = r.id AND aw.status = 'rejected') as rejected_count,
    (SELECT COUNT(*) FROM approval_workflow aw WHERE aw.request_id = r.id AND aw.status = 'pending') as pending_count
FROM requests r
JOIN applications a ON r.application_id = a.id;

-- View for user permissions
CREATE VIEW user_permissions AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    a.id as application_id,
    a.name as application_name,
    a.category as application_category,
    ap.access_level,
    ap.granted_duration,
    ap.is_active,
    ap.expires_at,
    ap.granted_at,
    ap.granted_by
FROM access_permissions ap
JOIN users u ON ap.user_id = u.id
JOIN applications a ON ap.application_id = a.id;

-- ============================================================
-- STORED PROCEDURES for common operations
-- ============================================================

-- Function to create request with approval workflow
CREATE OR REPLACE FUNCTION create_request_with_workflow(
    p_user_id VARCHAR(255),
    p_user_name VARCHAR(255),
    p_user_email VARCHAR(255),
    p_application_id UUID,
    p_business_justification TEXT,
    p_requested_access_level VARCHAR(100) DEFAULT 'Standard User',
    p_requested_duration VARCHAR(100) DEFAULT '1 year'
) RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
    v_app_record RECORD;
    v_manager_name TEXT;
    v_level INTEGER;
BEGIN
    -- Get application details
    SELECT * INTO v_app_record FROM applications WHERE id = p_application_id;
    
    -- Create request
    INSERT INTO requests (
        user_id, user_name, user_email, application_id, application_name,
        business_justification, requested_access_level, requested_duration,
        total_levels
    ) VALUES (
        p_user_id, p_user_name, p_user_email, p_application_id, v_app_record.name,
        p_business_justification, p_requested_access_level, p_requested_duration,
        CASE 
            WHEN v_app_record.type_level = 'Leveling' THEN array_length(v_app_record.managers, 1)
            ELSE 1
        END
    ) RETURNING id INTO v_request_id;
    
    -- Create approval workflow
    IF v_app_record.type_level = 'Leveling' AND array_length(v_app_record.managers, 1) > 0 THEN
        -- Create approval steps for each manager
        FOR v_level IN 1..array_length(v_app_record.managers, 1) LOOP
            v_manager_name := v_app_record.managers[v_level];
            
            INSERT INTO approval_workflow (
                request_id, level, manager_id, manager_name
            ) VALUES (
                v_request_id, v_level, v_manager_name, v_manager_name
            );
        END LOOP;
    ELSE
        -- Create single approval step for no-leveling apps
        INSERT INTO approval_workflow (
            request_id, level, manager_id, manager_name
        ) VALUES (
            v_request_id, 1, 'IT Admin', 'IT Admin'
        );
    END IF;
    
    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;

-- Function to approve request at specific level
CREATE OR REPLACE FUNCTION approve_request_level(
    p_request_id UUID,
    p_level INTEGER,
    p_manager_id VARCHAR(255),
    p_comments TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_total_levels INTEGER;
    v_approved_count INTEGER;
BEGIN
    -- Update approval workflow
    UPDATE approval_workflow 
    SET 
        status = 'approved',
        approved_at = NOW(),
        comments = p_comments
    WHERE request_id = p_request_id AND level = p_level;
    
    -- Get total levels and count approvals
    SELECT total_levels INTO v_total_levels FROM requests WHERE id = p_request_id;
    SELECT COUNT(*) INTO v_approved_count 
    FROM approval_workflow 
    WHERE request_id = p_request_id AND status = 'approved';
    
    -- Update request status if all levels approved
    IF v_approved_count = v_total_levels THEN
        UPDATE requests 
        SET 
            status = 'approved',
            approved_at = NOW(),
            current_level = v_total_levels
        WHERE id = p_request_id;
    ELSE
        -- Move to next level
        UPDATE requests 
        SET current_level = v_approved_count + 1
        WHERE id = p_request_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to reject request
CREATE OR REPLACE FUNCTION reject_request(
    p_request_id UUID,
    p_level INTEGER,
    p_manager_id VARCHAR(255),
    p_rejection_reason TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- Update approval workflow
    UPDATE approval_workflow 
    SET 
        status = 'rejected',
        rejected_at = NOW(),
        comments = p_rejection_reason
    WHERE request_id = p_request_id AND level = p_level;
    
    -- Update request status
    UPDATE requests 
    SET 
        status = 'rejected',
        rejected_at = NOW(),
        rejected_by = p_manager_id,
        rejection_reason = p_rejection_reason
    WHERE id = p_request_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SAMPLE USERS (for development only)
-- ============================================================
INSERT INTO users (id, name, email, role, department) VALUES
('staff_user_1', 'Alex Johnson', 'alex.johnson@company.com', 'staff', 'IT Department'),
('manager_a', 'Manager A', 'manager.a@company.com', 'manager', 'IT Department'),
('manager_b', 'Manager B', 'manager.b@company.com', 'manager', 'IT Department'),
('manager_c', 'Manager C', 'manager.c@company.com', 'manager', 'IT Department'),
('itadmin_1', 'IT Admin', 'itadmin@company.com', 'itadmin', 'IT Department');

-- ============================================================
-- COMPLETED SCHEMA
-- Ready for production use
-- ============================================================ 