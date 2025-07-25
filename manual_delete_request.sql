-- Manual delete for request that's stuck in cache
DELETE FROM approval_workflow WHERE request_id = '36e38183-0996-408d-93eb-70c55ba61d4d';
DELETE FROM requests WHERE id = '36e38183-0996-408d-93eb-70c55ba61d4d'; 