-- Function to safely delete a request and its related data
-- This function bypasses RLS and handles the deletion properly
CREATE OR REPLACE FUNCTION delete_request_safe(
  p_request_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_exists BOOLEAN;
  v_request_owner UUID;
  v_request_status TEXT;
  v_result JSON;
BEGIN
  -- Check if request exists and get its details
  SELECT EXISTS(SELECT 1 FROM requests WHERE id = p_request_id) INTO v_request_exists;
  
  IF NOT v_request_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Request not found'
    );
  END IF;
  
  -- Get request owner and status
  SELECT user_id, status INTO v_request_owner, v_request_status 
  FROM requests 
  WHERE id = p_request_id;
  
  -- Check if user owns the request
  IF v_request_owner != p_user_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You can only delete your own requests'
    );
  END IF;
  
  -- Check if request is pending
  IF v_request_status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You can only delete pending requests'
    );
  END IF;
  
  -- Delete approval workflows first
  DELETE FROM approval_workflow WHERE request_id = p_request_id;
  
  -- Delete the request
  DELETE FROM requests WHERE id = p_request_id;
  
  -- Check if deletion was successful
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Request deleted successfully',
      'deleted_request_id', p_request_id
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to delete request'
    );
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_request_safe(UUID, UUID) TO authenticated; 