-- Bypass RLS and manually delete the request
BEGIN;

-- Disable RLS temporarily
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflow DISABLE ROW LEVEL SECURITY;

-- Delete the request
DELETE FROM approval_workflow WHERE request_id = 'acf7acb7-7a0e-4113-bfdd-88605910c99d';
DELETE FROM requests WHERE id = 'acf7acb7-7a0e-4113-bfdd-88605910c99d';

-- Re-enable RLS
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflow ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Verify deletion
SELECT COUNT(*) as remaining_requests FROM requests WHERE id = 'acf7acb7-7a0e-4113-bfdd-88605910c99d';
SELECT COUNT(*) as remaining_approvals FROM approval_workflow WHERE request_id = 'acf7acb7-7a0e-4113-bfdd-88605910c99d'; 