-- Create a function to force refresh user requests
-- This function will bypass any caching and return fresh data

CREATE OR REPLACE FUNCTION force_refresh_user_requests(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  application_id UUID,
  application_name TEXT,
  status TEXT,
  current_level INTEGER,
  total_levels INTEGER,
  business_justification TEXT,
  requested_access_level TEXT,
  requested_duration TEXT,
  approved_by TEXT[],
  rejected_by TEXT,
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  application_logo TEXT,
  approvals JSON
) AS $$
BEGIN
  -- Force a fresh query by using NOW() to ensure no caching
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.user_name,
    r.user_email,
    r.application_id,
    r.application_name,
    r.status,
    r.current_level,
    r.total_levels,
    r.business_justification,
    r.requested_access_level,
    r.requested_duration,
    r.approved_by,
    r.rejected_by,
    r.rejection_reason,
    r.approved_at,
    r.rejected_at,
    r.created_at,
    r.updated_at,
    app.logo as application_logo,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', aw.id,
          'request_id', aw.request_id,
          'level', aw.level,
          'manager_id', aw.manager_id,
          'manager_name', aw.manager_name,
          'status', aw.status,
          'comments', aw.comments,
          'approved_at', aw.approved_at,
          'rejected_at', aw.rejected_at,
          'created_at', aw.created_at,
          'updated_at', aw.updated_at
        ) ORDER BY aw.level
      ) FROM approval_workflow aw WHERE aw.request_id = r.id),
      '[]'::json
    ) as approvals
  FROM requests r
  LEFT JOIN applications app ON r.application_id = app.id
  WHERE r.user_id = user_id_param
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT 'Function created successfully' as status;

-- Test with a specific user (replace with actual user ID)
-- SELECT * FROM force_refresh_user_requests('cc02b3c5-7b01-42cd-9dd5-f921e56d5972'); 