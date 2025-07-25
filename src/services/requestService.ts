import { supabase } from '../lib/supabase'
import { authService } from './authService'

export interface Application {
  id: string
  name: string
  description: string
  category: string
  type_level: 'Leveling' | 'No leveling'
  managers: string[] // Array of manager names
  logo: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StaffRequest {
  id: string
  user_id: string
  user_name: string
  user_email: string
  application_id: string
  application_name: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  current_level: number
  total_levels: number
  business_justification: string
  requested_access_level: string
  requested_duration: string
  approved_by: string[] // Array of manager names who approved
  rejected_by: string | null
  rejection_reason: string | null
  approved_at: string | null
  rejected_at: string | null
  created_at: string
  updated_at: string
}

export interface ApprovalWorkflow {
  id: string
  request_id: string
  level: number
  manager_id: string
  manager_name: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  comments: string | null
  approved_at: string | null
  rejected_at: string | null
  created_at: string
  updated_at: string
}

export interface RequestWithApprovals extends StaffRequest {
  approvals: ApprovalWorkflow[]
  application_logo?: string | null
}

// Check if Supabase is properly configured and connected
const isSupabaseConfigured = () => {
  return authService.isConfigured();
};

// Test Supabase connectivity for requests
let requestConnectionResult: boolean | null = null;
let lastRequestConnectionTest = 0;
const REQUEST_CONNECTION_CACHE_DURATION = 30000; // Cache for 30 seconds

const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }
    
    // Use cached result if recent
    const now = Date.now();
    if (requestConnectionResult !== null && (now - lastRequestConnectionTest) < REQUEST_CONNECTION_CACHE_DURATION) {
      return requestConnectionResult;
    }
    
    // Quick connectivity test with very short timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Quick timeout')), 500); // Very fast timeout
    });
    
    const testPromise = supabase.from('applications').select('count').limit(1);
    await Promise.race([testPromise, timeoutPromise]);
    
    requestConnectionResult = true;
    lastRequestConnectionTest = now;
    return true;
  } catch (error) {
    console.log('❌ Request service: Supabase connection failed');
    requestConnectionResult = false;
    lastRequestConnectionTest = Date.now();
    return false;
  }
};

// Reset cache function for logout
// @ts-ignore
window.__resetRequestServiceCache = () => {
  requestConnectionResult = null;
  lastRequestConnectionTest = 0;
  console.log('🔄 Request service cache reset');
};

export const requestService = {
  // Create new request with simplified workflow (no stored procedures needed)
  async createRequest(requestData: {
    application_id: string
    business_justification: string
    requested_access_level: string
    requested_duration: string
  }): Promise<RequestWithApprovals> {
    try {
      // Get current user
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot create requests.');
      }

      // Get application details
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', requestData.application_id)
        .single()
      
      if (appError || !application) {
        throw new Error('Application not found')
      }

      // Create the request
      const { data: request, error: requestError } = await supabase
        .from('requests')
        .insert([{
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_email: currentUser.email,
          application_id: requestData.application_id,
          application_name: application.name,
          status: 'pending',
          current_level: 1,
          total_levels: application.type_level === 'Leveling' ? 3 : 1, // A, B, C for leveling apps
          business_justification: requestData.business_justification,
          requested_access_level: requestData.requested_access_level,
          requested_duration: requestData.requested_duration,
          approved_by: [],
          rejected_by: null,
          rejection_reason: null
        }])
        .select()
        .single()
      
      if (requestError) throw requestError

      // Create approval workflow
      const approvalWorkflows = [];
      
      if (application.type_level === 'Leveling') {
        // Create 3-level approval for leveling apps
        const managers = ['Manager A', 'Manager B', 'Manager C'];
        for (let i = 0; i < managers.length; i++) {
          approvalWorkflows.push({
            request_id: request.id,
            level: i + 1,
            manager_id: `manager_${String.fromCharCode(97 + i)}`, // manager_a, manager_b, manager_c
            manager_name: managers[i],
            status: 'pending'
          });
        }
      } else {
        // For No leveling apps, use the assigned managers from the application
        if (application.managers && application.managers.length > 0) {
          // Use assigned managers
          application.managers.forEach((managerName, index) => {
            approvalWorkflows.push({
              request_id: request.id,
              level: index + 1,
              manager_id: managerName.toLowerCase().replace(' ', '_'), // manager_a, manager_b, etc.
              manager_name: managerName,
              status: 'pending'
            });
          });
        } else {
          // Fallback to IT Admin if no managers assigned
          approvalWorkflows.push({
            request_id: request.id,
            level: 1,
            manager_id: 'itadmin_1',
            manager_name: 'IT Admin',
            status: 'pending'
          });
        }
      }

      const { data: approvals, error: approvalError } = await supabase
        .from('approval_workflow')
        .insert(approvalWorkflows)
        .select()
      
      if (approvalError) throw approvalError

      return {
        ...request,
        approvals: approvals || [],
        application_logo: application.logo
      }
    } catch (error) {
      console.error('Error creating request:', error)
      throw error
    }
  },

  // Force refresh user requests using raw SQL to bypass cache
  async forceRefreshUserRequests(): Promise<RequestWithApprovals[]> {
    try {
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot load requests.');
      }

      console.log('🔄 Force refreshing requests using raw SQL...');
      console.log('🔍 Debug: Current user ID:', currentUser.id);

      // Use raw SQL query to bypass any caching
      const { data: requests, error } = await supabase
        .rpc('force_refresh_user_requests', {
          user_id_param: currentUser.id
        });

      if (error) {
        console.error('❌ Error in force refresh:', error);
        // Fallback to normal query if RPC doesn't exist
        console.log('🔄 Falling back to normal query...');
        return this.getUserRequests(false);
      }
      
      console.log('✅ Force refreshed', requests?.length || 0, 'requests');
      
      return requests || [];
    } catch (error) {
      console.error('💥 Error in forceRefreshUserRequests:', error);
      // Fallback to normal query
      return this.getUserRequests(false);
    }
  },

  // Get user's requests
  async getUserRequests(forceRefresh: boolean = false): Promise<RequestWithApprovals[]> {
    try {
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot fetch user requests.');
      }

      console.log('🔌 Loading requests from Supabase...');
      console.log('🔍 Debug: Current user ID:', currentUser?.id);

      // Add timestamp to bypass cache if forceRefresh is true
      const timestamp = forceRefresh ? `?t=${Date.now()}` : '';
      
      // Get real data from Supabase
      const { data: requests, error: requestsError } = await supabase
        .from('requests')
        .select(`
          *,
          approval_workflow(*)
        `)
        .eq('user_id', currentUser?.id)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('❌ Error loading requests:', requestsError);
        throw requestsError;
      }

      if (requests && requests.length > 0) {
        console.log('✅ Loaded', requests.length, 'requests from Supabase');
        
        // Log each request for debugging
        requests.forEach((request, index) => {
          console.log(`🔍 Debug: Request ${index + 1}:`, {
            id: request.id,
            application_name: request.application_name,
            status: request.status,
            user_id: request.user_id,
            created_at: request.created_at
          });
        });
        
        // Transform Supabase data to our format
        const transformedRequests = requests.map(request => ({
          id: request.id,
          user_id: request.user_id,
          user_name: request.user_name,
          user_email: request.user_email,
          application_id: request.application_id,
          application_name: request.application_name,
          application_logo: `/app-logo/${request.application_name.toLowerCase().replace(/\s+/g, '-')}.png`,
          business_justification: request.business_justification,
          status: request.status,
          current_level: request.current_level,
          total_levels: request.total_levels,
          created_at: request.created_at,
          updated_at: request.updated_at,
          approved_by: request.approved_by || [],
          rejected_by: request.rejected_by,
          rejection_reason: request.rejection_reason,
          approved_at: request.approved_at,
          rejected_at: request.rejected_at,
          approvals: (request.approval_workflow || []).map((approval: any) => ({
            id: approval.id,
            request_id: approval.request_id,
            level: approval.level,
            manager_id: approval.manager_id,
            manager_name: approval.manager_name,
            status: approval.status,
            comments: approval.comments,
            approved_at: approval.approved_at,
            rejected_at: approval.rejected_at,
            created_at: approval.created_at,
            updated_at: approval.updated_at
          }))
        }));

        return transformedRequests;
      } else {
        console.log('✅ No requests found for user');
        return [];
      }
    } catch (error) {
      console.error('💥 Error loading user requests:', error);
      throw error;
    }
  },

  // Get requests for manager approval
  async getManagerRequests(): Promise<RequestWithApprovals[]> {
    try {
      const currentUser = await authService.getCurrentUser()
      if (!currentUser || currentUser.role !== 'manager') {
        throw new Error('Unauthorized: Manager access required')
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot fetch manager requests.');
      }

      console.log('🔍 Getting requests for manager:', currentUser.name);

      // Get all pending requests with their approval workflow
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          approval_workflow (*),
          applications (logo)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Filter requests based on sequential approval logic
      const filteredRequests = data?.filter(req => {
        const approvals = req.approval_workflow?.sort((a: any, b: any) => a.level - b.level) || [];
        
        // Debug: Log all approvals for this request
        console.log(`🔍 Debug request ${req.id}:`, {
          application_name: req.application_name,
          approvals: approvals.map((a: any) => ({
            level: a.level,
            manager_name: a.manager_name,
            status: a.status
          })),
          currentUser: currentUser.name
        });
        
        const currentManagerApproval = approvals.find((a: any) => a.manager_name === currentUser.name);
        
        if (!currentManagerApproval) {
          console.log(`⚠️ Manager ${currentUser.name} not found in approval workflow for request ${req.id}`);
          console.log(`🔍 Available managers:`, approvals.map((a: any) => a.manager_name));
          return false;
        }

        const currentLevel = currentManagerApproval.level;
        console.log(`🔍 Request ${req.id}: Manager ${currentUser.name} is at level ${currentLevel}`);

        // For No leveling applications, if manager is assigned, they can approve directly
        // For Leveling applications, check sequential approval
        const isLevelingApp = approvals.length > 1; // More than 1 approval level = Leveling app
        
        if (!isLevelingApp) {
          // No leveling app - manager can approve if they are assigned
          const currentLevelPending = currentManagerApproval.status === 'pending';
          console.log(`📋 No leveling app: Manager ${currentUser.name} can approve directly: ${currentLevelPending}`);
          return currentLevelPending;
        }

        // Leveling app - check sequential approval
        // Check if all previous levels have been approved
        const previousLevelsApproved = approvals
          .filter((a: any) => a.level < currentLevel)
          .every((a: any) => a.status === 'approved');

        // Check if current level is pending
        const currentLevelPending = currentManagerApproval.status === 'pending';

        // Check if any previous level was rejected
        const anyPreviousRejected = approvals
          .filter((a: any) => a.level < currentLevel)
          .some((a: any) => a.status === 'rejected');

        if (anyPreviousRejected) {
          console.log(`❌ Request ${req.id}: Previous level was rejected, skipping`);
          return false;
        }

        if (!previousLevelsApproved) {
          console.log(`⏳ Request ${req.id}: Previous levels not yet approved, skipping`);
          return false;
        }

        if (!currentLevelPending) {
          console.log(`✅ Request ${req.id}: Current level already processed, skipping`);
          return false;
        }

        console.log(`✅ Request ${req.id}: Ready for manager ${currentUser.name} at level ${currentLevel}`);
        return true;
      }) || []
      
      console.log(`📋 Found ${filteredRequests.length} requests ready for manager ${currentUser.name}`);

      return filteredRequests.map(req => ({
        ...req,
        approvals: req.approval_workflow?.sort((a: any, b: any) => a.level - b.level) || [],
        application_logo: req.applications?.logo || null
      }))
    } catch (error) {
      console.error('Error fetching manager requests:', error)
      throw error
    }
  },

  // Approve a request (manager action) with sequential approval logic
  async approveRequest(requestId: string, managerName: string, comments: string = ''): Promise<void> {
    try {
      console.log('🔍 Debug: Starting approval process for requestId:', requestId);
      console.log('🔍 Debug: Manager name:', managerName);
      
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }
      
      console.log('🔍 Debug: Current user:', currentUser.email);

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot approve requests.');
      }

      // Use real Supabase function for approval
      console.log('🔌 Using Supabase sequential approval');
      const { data, error } = await supabase.rpc('approve_request_sequential', {
        p_request_id: requestId,
        p_manager_name: managerName,
        p_approval_comments: comments
      });

      if (error) {
        console.error('❌ Supabase approval error:', error);
        throw new Error(`Approval failed: ${error.message}`);
      }

      if (data && !data.success) {
        console.error('❌ Approval logic error:', data.error);
        throw new Error(data.error || 'Approval failed');
      }

      console.log('✅ Supabase approval successful:', data);
    } catch (error) {
      console.error('💥 Error approving request:', error);
      throw error;
    }
  },

  // Reject a request (manager action) - immediately rejects regardless of level
  async rejectRequest(requestId: string, managerName: string, reason: string): Promise<void> {
    try {
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot reject requests.');
      }

      // Use real Supabase function for rejection
      console.log('🔌 Using Supabase rejection');
      const { data, error } = await supabase.rpc('reject_request_sequential', {
        p_request_id: requestId,
        p_manager_name: managerName,
        p_rejection_reason: reason
      });

      if (error) {
        console.error('❌ Supabase rejection error:', error);
        throw new Error(`Rejection failed: ${error.message}`);
      }

      if (data && !data.success) {
        console.error('❌ Rejection logic error:', data.error);
        throw new Error(data.error || 'Rejection failed');
      }

      console.log('✅ Supabase rejection successful:', data);
    } catch (error) {
      console.error('💥 Error rejecting request:', error);
      throw error;
    }
  },

  // Get request by ID
  async getRequestById(id: string): Promise<RequestWithApprovals | null> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot fetch request.');
      }

      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          approval_workflow (*),
          applications (logo)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      return {
        ...data,
        approvals: data.approval_workflow?.sort((a: any, b: any) => a.level - b.level) || [],
        application_logo: data.applications?.logo || null
      }
    } catch (error) {
      console.error('Error fetching request:', error)
      throw error
    }
  },

  // Applications CRUD Operations
  async createApplication(applicationData: {
    name: string
    description: string
    category: string
    type_level: 'Leveling' | 'No leveling'
    managers: string[]
    logo: string
  }): Promise<Application> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot create applications.');
      }

      const { data, error } = await supabase
        .from('applications')
        .insert([{
          ...applicationData,
          is_active: true
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating application:', error)
      throw error
    }
  },

  // Get all applications
  async getApplications(): Promise<Application[]> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot fetch applications.');
      }

      console.log('🔌 Loading applications from Supabase...');
      
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .order('name');

      if (error) {
        console.log('❌ Supabase applications failed:', error?.message);
        throw new Error(`Failed to load applications: ${error?.message || 'Unknown error'}`);
      }

      console.log(`✅ Loaded ${applications?.length || 0} applications from Supabase:`, applications);
      return applications || [];
    } catch (error) {
      console.error('💥 Error getting applications:', error);
      throw error;
    }
  },

  async getApplicationById(id: string): Promise<Application | null> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot fetch application by ID.');
      }

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error loading application by ID:', error);
        return null;
      }

      console.log('✅ Loaded application by ID:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in getApplicationById:', error);
      return null;
    }
  },

  async updateApplication(id: string, applicationData: {
    name?: string
    description?: string
    category?: string
    type_level?: 'Leveling' | 'No leveling'
    managers?: string[]
    logo?: string
  }): Promise<Application> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot update applications.');
      }

      const { data, error } = await supabase
        .from('applications')
        .update(applicationData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating application:', error)
      throw error
    }
  },

  async deleteApplication(id: string): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot delete applications.');
      }

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('applications')
        .update({ is_active: false })
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error deleting application:', error)
      throw error
    }
  },

  // Delete a request (user can only delete their own approved/rejected requests)
  async deleteRequest(requestId: string): Promise<void> {
    try {
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot delete requests.');
      }

      console.log('🔍 Debug: Starting delete process for request:', requestId);

      // First, get the request to check ownership and status
      const { data: request, error: fetchError } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (fetchError || !request) {
        console.error('❌ Error fetching request:', fetchError);
        throw new Error('Request not found')
      }

      console.log('🔍 Debug: Found request:', {
        id: request.id,
        user_id: request.user_id,
        current_user_id: currentUser.id,
        status: request.status,
        application_name: request.application_name
      });

      // Check if user owns this request
      if (request.user_id !== currentUser.id) {
        console.error('❌ Ownership check failed:', {
          request_user_id: request.user_id,
          current_user_id: currentUser.id
        });
        throw new Error('You can only delete your own requests')
      }

      // Allow deletion for all statuses (pending, approved, rejected)
      console.log('✅ Status check passed - allowing deletion for status:', request.status);

      console.log('✅ All checks passed, proceeding with deletion...');

      // Use explicit transaction
      const { data: deleteApprovalResult, error: deleteApprovalError } = await supabase
        .from('approval_workflow')
        .delete()
        .eq('request_id', requestId)
        .select()

      if (deleteApprovalError) {
        console.error('❌ Error deleting approval workflow:', deleteApprovalError);
        throw new Error('Failed to delete approval workflow')
      }

      console.log('✅ Approval workflow records deleted:', deleteApprovalResult?.length || 0, 'records');

      // Now delete the request with explicit result checking
      const { data: deleteRequestResult, error: deleteError } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId)
        .select()

      if (deleteError) {
        console.error('❌ Supabase delete error:', deleteError);
        throw new Error('Failed to delete request')
      }

      if (!deleteRequestResult || deleteRequestResult.length === 0) {
        console.error('❌ No rows were deleted from requests table');
        throw new Error('No rows were deleted - request may not exist or RLS policy blocked deletion')
      }

      console.log('✅ Request deleted successfully from database:', requestId);
      console.log('✅ Deleted request data:', deleteRequestResult[0]);
      
      // Verify deletion
      const { data: verifyRequest, error: verifyError } = await supabase
        .from('requests')
        .select('id')
        .eq('id', requestId)
        .single()

      if (verifyRequest) {
        console.error('❌ Verification failed - request still exists after deletion');
        throw new Error('Request still exists after deletion - RLS policy may be blocking')
      }

      console.log('✅ Verification passed - request successfully deleted');
      console.log('✅ Delete operation completed successfully');
    } catch (error) {
      console.error('💥 Error deleting request:', error);
      throw error;
    }
  },

  // Get all requests for managers and IT admins to review
  async getAllRequests(): Promise<RequestWithApprovals[]> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot fetch all requests.');
      }

      console.log('🔌 Loading real requests from Supabase...');
      
      // Get real data from Supabase
      const { data: requests, error: requestsError } = await supabase
        .from('requests')
        .select(`
          *,
          approval_workflow(*)
        `)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('❌ Error loading requests:', requestsError);
        throw requestsError;
      }

      if (requests && requests.length > 0) {
        console.log('✅ Loaded real requests from Supabase:', requests.length);
        
        // Transform Supabase data to our format
        const transformedRequests = requests.map(request => ({
          id: request.id,
          user_id: request.user_id,
          user_name: request.user_name,
          user_email: request.user_email,
          application_id: request.application_id,
          application_name: request.application_name,
          application_logo: `/app-logo/${request.application_name.toLowerCase().replace(/\s+/g, '-')}.png`,
          business_justification: request.business_justification,
          status: request.status,
          current_level: request.current_level,
          total_levels: request.total_levels,
          created_at: request.created_at,
          updated_at: request.updated_at,
          approved_by: request.approved_by || [],
          rejected_by: request.rejected_by,
          rejection_reason: request.rejection_reason,
          approved_at: request.approved_at,
          rejected_at: request.rejected_at,
          approvals: (request.approval_workflow || []).map((approval: any) => ({
            id: approval.id,
            request_id: approval.request_id,
            level: approval.level,
            manager_name: approval.manager_name,
            manager_email: `${approval.manager_id}@company.com`,
            status: approval.status,
            approved_at: approval.approved_at,
            rejected_at: approval.rejected_at,
            comments: approval.comments
          })).sort((a: any, b: any) => a.level - b.level)
        }));
        
        return transformedRequests;
      } else {
        console.log('📝 No real requests found in database');
        return [];
      }
    } catch (error) {
      console.error('❌ Error getting all requests:', error);
      throw error;
    }
  },

  // Check if user has approved access to an application
  async checkUserAccess(applicationId: string): Promise<{ hasAccess: boolean; requestStatus?: string }> {
    try {
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        return { hasAccess: false };
      }

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Cannot check access.');
      }

      // Check if user has an approved request for this application
      const { data: request, error } = await supabase
        .from('requests')
        .select('status')
        .eq('user_id', currentUser.id)
        .eq('application_id', applicationId)
        .eq('status', 'approved')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return {
        hasAccess: !!request,
        requestStatus: request?.status
      };
    } catch (error) {
      console.error('Error checking user access:', error);
      return { hasAccess: false };
    }
  },

  // Campaign Management Functions
  async getCampaigns(): Promise<any[]> {
    try {
      console.log('🔌 Loading campaigns from Supabase...');
      
      // First, try to get campaigns without foreign key relationship
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading campaigns:', error);
        // If campaigns table doesn't exist, return empty array
        if (error.code === '42P01') { // Table doesn't exist
          console.log('⚠️ Campaigns table doesn\'t exist, returning empty array');
          return [];
        }
        throw error;
      }

      console.log('✅ Loaded campaigns from Supabase:', data);
      
      // Transform data to include application_name by fetching it separately
      const transformedData = await Promise.all(
        (data || []).map(async (campaign) => {
          let application_name = 'Unknown Application';
          
          if (campaign.application_id) {
            try {
              const { data: appData } = await supabase
                .from('applications')
                .select('name')
                .eq('id', campaign.application_id)
                .single();
              
              if (appData) {
                application_name = appData.name;
              }
            } catch (appError) {
              console.warn(`⚠️ Could not fetch application name for campaign ${campaign.id}:`, appError);
            }
          }
          
          // Ensure assigned_managers is always an array and clean up any invalid entries
          let assigned_managers: string[] = [];
          if (campaign.assigned_managers && Array.isArray(campaign.assigned_managers)) {
            assigned_managers = campaign.assigned_managers.filter(manager => 
              manager && typeof manager === 'string' && manager.trim() !== ''
            );
          }
          
          // Ensure all required fields have default values
          const cleanCampaign = {
            id: campaign.id || '',
            name: campaign.name || 'Unnamed Campaign',
            description: campaign.description || '',
            application_id: campaign.application_id || null,
            application_name: application_name,
            application_ids: campaign.application_ids || [campaign.application_id], // Include application_ids
            due_date: campaign.due_date || new Date().toISOString().split('T')[0],
            assigned_managers: assigned_managers,
            status: campaign.status || 'active',
            users_to_review: campaign.users_to_review || 0,
            progress: campaign.progress || 0,
            created_at: campaign.created_at || new Date().toISOString(),
            updated_at: campaign.updated_at || new Date().toISOString()
          };
          
          console.log(`🔍 Processed campaign: ${cleanCampaign.name}`, {
            assigned_managers: cleanCampaign.assigned_managers,
            application_name: cleanCampaign.application_name
          });
          
          return cleanCampaign;
        })
      );

      return transformedData;
    } catch (error) {
      console.error('💥 Error in getCampaigns:', error);
      // Return empty array instead of throwing error
      return [];
    }
  },

  async createCampaign(campaignData: {
    name: string;
    description: string;
    application_id: string;
    application_ids?: string[]; // Support multiple applications
    due_date: string;
    assigned_managers: string[];
    status: 'active' | 'completed';
  }): Promise<any> {
    try {
      console.log('🔌 Creating campaign in Supabase:', campaignData);
      
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          name: campaignData.name,
          description: campaignData.description,
          application_id: campaignData.application_id,
          application_ids: campaignData.application_ids || [campaignData.application_id],
          due_date: campaignData.due_date,
          assigned_managers: campaignData.assigned_managers,
          status: campaignData.status,
          users_to_review: 0, // Will be calculated later
          progress: 0
        }])
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error creating campaign:', error);
        throw error;
      }

      console.log('✅ Campaign created successfully:', data);
      
      // Get application name separately to avoid foreign key relationship issues
      let application_name = 'Unknown Application';
      try {
        const { data: appData } = await supabase
          .from('applications')
          .select('name')
          .eq('id', campaignData.application_id)
          .single();
        
        if (appData) {
          application_name = appData.name;
        }
      } catch (appError) {
        console.warn('⚠️ Could not fetch application name:', appError);
      }

      // Transform data to include application_name and application_ids
      const transformedData = {
        ...data,
        application_name: application_name,
        application_ids: campaignData.application_ids || [campaignData.application_id]
      };

      return transformedData;
    } catch (error) {
      console.error('💥 Error creating campaign:', error);
      throw error;
    }
  },

  async updateCampaign(campaignId: string, updates: any): Promise<any> {
    try {
      console.log('🔌 Updating campaign in Supabase:', { campaignId, updates });
      
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', campaignId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating campaign:', error);
        throw error;
      }

      console.log('✅ Campaign updated successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 Error in updateCampaign:', error);
      throw error;
    }
  },

  async deleteCampaign(campaignId: string): Promise<void> {
    try {
      console.log('🔌 Deleting campaign from Supabase:', campaignId);
      
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        console.error('❌ Error deleting campaign:', error);
        throw error;
      }

      console.log('✅ Campaign deleted successfully');
    } catch (error) {
      console.error('💥 Error in deleteCampaign:', error);
      throw error;
    }
  },

  // Campaign Users Management
  async getCampaignUsers(campaignId: string): Promise<any[]> {
    try {
      console.log('🔌 Loading campaign users from Supabase:', campaignId);
      
      const { data, error } = await supabase
        .from('campaign_users')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .order('user_name', { ascending: true });

      if (error) {
        console.error('❌ Error loading campaign users:', error);
        throw error;
      }

      console.log('✅ Loaded campaign users:', data);
      return data || [];
    } catch (error) {
      console.error('💥 Error in getCampaignUsers:', error);
      return [];
    }
  },

  // Get all master users (for campaign assignment)
  async getMasterUsers(): Promise<any[]> {
    try {
      console.log('🔌 Loading master users from Supabase...');
      
      const { data, error } = await supabase
        .from('campaign_users_master')
        .select('*')
        .eq('is_active', true)
        .order('user_name', { ascending: true });

      if (error) {
        console.error('❌ Error loading master users:', error);
        throw error;
      }

      console.log('✅ Loaded master users:', data);
      return data || [];
    } catch (error) {
      console.error('💥 Error in getMasterUsers:', error);
      return [];
    }
  },

  async addUsersToCampaign(campaignId: string, applicationId: string): Promise<void> {
    try {
      console.log('🔌 Adding users to campaign:', { campaignId, applicationId });

      // Get master users first
      const masterUsers = await this.getMasterUsers();
      console.log('🔍 Found master users:', masterUsers.length);

      if (!masterUsers || masterUsers.length === 0) {
        console.log('⚠️ No master users found, cannot add users to campaign');
        return;
      }

      // Check if users are already added for this campaign
      const { data: existingUsers, error: checkError } = await supabase
        .from('campaign_users')
        .select('user_id')
        .eq('campaign_id', campaignId);

      if (checkError) {
        console.error('❌ Error checking existing users:', checkError);
        throw checkError;
      }

      // If users already exist for this campaign, skip adding duplicates
      if (existingUsers && existingUsers.length > 0) {
        console.log('✅ Users already exist for campaign, skipping duplicate addition');
        return;
      }

      // Get application name
      const { data: appData } = await supabase
        .from('applications')
        .select('name')
        .eq('id', applicationId)
        .single();

      const applicationName = appData?.name || 'Unknown Application';

      // Prepare user data for this specific application
      const userData = masterUsers.map(user => ({
        campaign_id: campaignId,
        user_id: user.user_id || user.id, // Handle both field names
        user_name: user.user_name || user.name, // Handle both field names
        user_email: user.user_email || user.email, // Handle both field names
        application_id: applicationId,
        application_name: applicationName, // Use actual application name
        current_access_level: this.getAccessLevelByPosition(user.position || user.role || 'User'),
        access_granted_date: user.access_date || user.access_granted_date || new Date().toISOString().split('T')[0],
        is_active: true
      }));

      console.log('📝 Preparing to insert users:', userData.length);
      console.log('📝 Sample user data:', userData[0]);

      // Insert users into campaign_users table
      const { error: insertError } = await supabase
        .from('campaign_users')
        .insert(userData);

      if (insertError) {
        console.error('❌ Error inserting users:', insertError);
        throw insertError;
      }

      console.log('✅ Successfully added users to campaign for application:', applicationId);

    } catch (error) {
      console.error('💥 Error adding users to campaign:', error);
      throw error;
    }
  },

  // Helper function to determine access level based on position
  getAccessLevelByPosition(position: string): string {
    if (!position) return 'Standard Access';
    
    const positionLower = position.toLowerCase();
    
    if (positionLower.includes('admin') || positionLower.includes('administrator')) {
      return 'Admin Access';
    } else if (positionLower.includes('engineer') || positionLower.includes('devops')) {
      return 'Full Access';
    } else if (positionLower.includes('developer')) {
      return 'Developer Access';
    } else if (positionLower.includes('analyst')) {
      return 'Analyst Access';
    } else {
      return 'Standard Access';
    }
  },

  // Helper function to generate random access date (within last year)
  getRandomAccessDate(): string {
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
    const randomTime = oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime());
    return new Date(randomTime).toISOString();
  },

  // Audit Results Management
  async getAuditResults(campaignId: string): Promise<any[]> {
    try {
      console.log('🔌 Loading audit results from Supabase:', campaignId);
      
      const { data, error } = await supabase
        .from('audit_results')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('reviewed_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading audit results:', error);
        throw error;
      }

      console.log('✅ Loaded audit results:', data);
      return data || [];
    } catch (error) {
      console.error('💥 Error in getAuditResults:', error);
      return [];
    }
  },

  async submitAuditDecision(
    campaignId: string,
    userId: string,
    applicationId: string,
    managerName: string,
    decision: 'yes' | 'no',
    comments: string = ''
  ): Promise<void> {
    try {
      console.log('🔌 Submitting audit decision:', {
        campaignId,
        userId,
        applicationId,
        managerName,
        decision,
        comments
      });

      // Get user email
      const { data: userData } = await supabase
        .from('campaign_users')
        .select('user_email')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)
        .single();

      const userEmail = userData?.user_email || '';

      // Insert or update audit result
      const { error } = await supabase
        .from('audit_results')
        .upsert([{
          campaign_id: campaignId,
          campaign_user_id: null, // Will be set by trigger or manually
          user_id: userId,
          user_email: userEmail,
          application_id: applicationId,
          manager_id: managerName, // Using manager name as ID for now
          manager_name: managerName,
          decision: decision,
          comments: comments,
          reviewed_at: new Date().toISOString()
        }], {
          onConflict: 'campaign_id,user_id,application_id'
        });

      if (error) {
        console.error('❌ Error submitting audit decision:', error);
        throw error;
      }

      console.log('✅ Audit decision submitted successfully');
    } catch (error) {
      console.error('💥 Error in submitAuditDecision:', error);
      throw error;
    }
  },

  async submitAuditResult(auditData: {
    campaign_id: string;
    user_id: string;
    user_email: string;
    manager_name: string;
    decision: 'yes' | 'no' | 'pending';
    comments: string;
    reviewed_at: string;
  }): Promise<void> {
    try {
      console.log('🔌 Submitting audit result:', auditData);

      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }

      // Check if audit result already exists
      const { data: existingResult } = await supabase
        .from('audit_results')
        .select('id')
        .eq('campaign_id', auditData.campaign_id)
        .eq('user_id', auditData.user_id)
        .single();

      if (existingResult) {
        // Update existing result
        const { error: updateError } = await supabase
          .from('audit_results')
          .update({
            decision: auditData.decision,
            comments: auditData.comments,
            reviewed_at: auditData.reviewed_at,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingResult.id);

        if (updateError) {
          console.error('❌ Error updating audit result:', updateError);
          throw updateError;
        }

        console.log('✅ Updated existing audit result');
      } else {
        // Insert new result
        const { error: insertError } = await supabase
          .from('audit_results')
          .insert({
            campaign_id: auditData.campaign_id,
            user_id: auditData.user_id,
            user_email: auditData.user_email,
            manager_name: auditData.manager_name,
            decision: auditData.decision,
            comments: auditData.comments,
            reviewed_at: auditData.reviewed_at,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('❌ Error inserting audit result:', insertError);
          throw insertError;
        }

        console.log('✅ Created new audit result');
      }

      // Update campaign progress
      await this.updateCampaignProgress(auditData.campaign_id);

    } catch (error) {
      console.error('💥 Error submitting audit result:', error);
      throw error;
    }
  },

  async updateCampaignProgress(campaignId: string): Promise<void> {
    try {
      // Get total users in campaign
      const { data: campaignUsers } = await supabase
        .from('campaign_users')
        .select('user_id')
        .eq('campaign_id', campaignId)
        .eq('is_active', true);

      // Get reviewed users
      const { data: auditResults } = await supabase
        .from('audit_results')
        .select('user_id')
        .eq('campaign_id', campaignId);

      if (campaignUsers && auditResults) {
        const totalUsers = campaignUsers.length;
        const reviewedUsers = auditResults.length;
        const progress = totalUsers > 0 ? Math.round((reviewedUsers / totalUsers) * 100) : 0;

        // Update campaign progress
        await supabase
          .from('campaigns')
          .update({ progress: progress })
          .eq('id', campaignId);

        console.log(`✅ Updated campaign progress: ${progress}% (${reviewedUsers}/${totalUsers})`);
      }
    } catch (error) {
      console.error('💥 Error updating campaign progress:', error);
    }
  },

  // Campaign Settings Management
  async getCampaignSettings(campaignId: string): Promise<any> {
    try {
      console.log('🔌 Loading campaign settings from Supabase:', campaignId);
      
      const { data, error } = await supabase
        .from('campaign_settings')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (error) {
        console.error('❌ Error loading campaign settings:', error);
        return null;
      }

      console.log('✅ Loaded campaign settings:', data);
      return data;
    } catch (error) {
      console.error('💥 Error in getCampaignSettings:', error);
      return null;
    }
  },

  async createCampaignSettings(campaignId: string, settings: {
    start_date: string;
    end_date: string;
    review_period_days?: number;
    auto_revoke_access?: boolean;
    notification_emails?: string[];
  }): Promise<any> {
    try {
      console.log('🔌 Creating campaign settings in Supabase:', { campaignId, settings });
      
      const { data, error } = await supabase
        .from('campaign_settings')
        .insert([{
          campaign_id: campaignId,
          start_date: settings.start_date,
          end_date: settings.end_date,
          review_period_days: settings.review_period_days || 30,
          auto_revoke_access: settings.auto_revoke_access || false,
          notification_emails: settings.notification_emails || []
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating campaign settings:', error);
        throw error;
      }

      console.log('✅ Campaign settings created successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 Error in createCampaignSettings:', error);
      throw error;
    }
  },

  // Check if user can create campaign (3-month rule)
  async canCreateCampaign(applicationId: string): Promise<boolean> {
    try {
      console.log('🔌 Checking if user can create campaign for application:', applicationId);
      
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data, error } = await supabase
        .from('campaigns')
        .select('id')
        .eq('application_id', applicationId)
        .gte('created_at', threeMonthsAgo.toISOString())
        .eq('status', 'active');

      if (error) {
        console.error('❌ Error checking campaign creation eligibility:', error);
        return false;
      }

      const canCreate = !data || data.length === 0;
      console.log('✅ Can create campaign:', canCreate);
      return canCreate;
    } catch (error) {
      console.error('💥 Error in canCreateCampaign:', error);
      return false;
    }
  }
} 