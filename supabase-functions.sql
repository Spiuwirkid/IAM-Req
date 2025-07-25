-- Supabase Functions for IAM Request System
-- Run this in Supabase SQL Editor to create the approval workflow functions

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