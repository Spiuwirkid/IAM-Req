import { supabase } from '../lib/supabase'

export interface Application {
  id: string
  name: string
  description: string
  category: string
  type_level: 'Leveling' | 'No leveling'
  managers: string[]
  logo: string
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
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface ApprovalWorkflow {
  id: string
  request_id: string
  level: number
  manager_id: string
  manager_name: string
  status: 'pending' | 'approved' | 'rejected'
  approved_at: string | null
  comments: string | null
  created_at: string
  updated_at: string
}

export interface RequestWithApprovals extends StaffRequest {
  approvals: ApprovalWorkflow[]
  application_logo?: string | null
}

export const requestService = {
  // Create new request using stored procedure
  async createRequest(requestData: {
    user_id: string
    user_name: string
    user_email: string
    application_id: string
    application_name: string
    business_justification: string
    requested_access_level: string
    requested_duration: string
  }): Promise<RequestWithApprovals> {
    try {
      // Use stored procedure to create request with proper workflow
      const { data: requestId, error: procedureError } = await supabase
        .rpc('create_request_with_workflow', {
          p_user_id: requestData.user_id,
          p_user_name: requestData.user_name,
          p_user_email: requestData.user_email,
          p_application_id: requestData.application_id,
          p_business_justification: requestData.business_justification,
          p_requested_access_level: requestData.requested_access_level,
          p_requested_duration: requestData.requested_duration
        })
      
      if (procedureError) throw procedureError

      // Get the created request with approvals
      const { data: requestWithApprovals, error: fetchError } = await supabase
        .from('requests')
        .select(`
          *,
          approval_workflow(*)
        `)
        .eq('id', requestId)
        .single()
      
      if (fetchError) throw fetchError

      return {
        ...requestWithApprovals,
        approvals: requestWithApprovals.approval_workflow || []
      }
    } catch (error) {
      console.error('Error creating request:', error)
      throw error
    }
  },

  // Get requests for user
  async getUserRequests(userId: string): Promise<RequestWithApprovals[]> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          approval_workflow (*),
          applications (logo)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data?.map(req => ({
        ...req,
        approvals: req.approval_workflow || [],
        application_logo: req.applications?.logo || null
      })) || []
    } catch (error) {
      console.error('Error fetching user requests:', error)
      throw error
    }
  },

  // Get request by ID
  async getRequestById(id: string): Promise<RequestWithApprovals | null> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          approval_workflow (*)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      return {
        ...data,
        approvals: data.approval_workflow || []
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
      const { data, error } = await supabase
        .from('applications')
        .insert([applicationData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating application:', error)
      throw error
    }
  },

  async getApplications(): Promise<Application[]> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching applications:', error)
      throw error
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
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error deleting application:', error)
      throw error
    }
  },

  // Delete a request (only if pending)
  async deleteRequest(requestId: string): Promise<void> {
    try {
      // First delete all approval workflows for this request
      const { error: approvalError } = await supabase
        .from('approval_workflow')
        .delete()
        .eq('request_id', requestId)
      
      if (approvalError) throw approvalError

      // Then delete the request itself
      const { error: requestError } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId)
        .eq('status', 'pending') // Only allow deleting pending requests
      
      if (requestError) throw requestError
    } catch (error) {
      console.error('Error deleting request:', error)
      throw error
    }
  }
} 