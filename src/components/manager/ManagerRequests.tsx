
import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, Users, Calendar, MessageSquare, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { requestService, type RequestWithApprovals } from '../../services/requestService';
import { useCustomAlert, showSuccessAlert, showErrorAlert } from '../ui/custom-alert';

const ManagerRequests = () => {
  const { user } = useOutletContext<{ user: any }>();
  const navigate = useNavigate();
  const [allRequests, setAllRequests] = useState<RequestWithApprovals[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [expandedStaff, setExpandedStaff] = useState<Record<string, boolean>>({});
  const [selectedAppRequest, setSelectedAppRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { showAlert, AlertComponent } = useCustomAlert();

  const handleBack = () => {
    navigate('/manager-dashboard');
  };

  // Load real requests from database
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoadingRequests(true);
        const requests = await requestService.getManagerRequests();
        setAllRequests(requests);
      } catch (error) {
        console.error('Error loading manager requests:', error);
        setAllRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    };

    loadRequests();
  }, []);

  // Group requests by user
  const groupedRequests = allRequests.reduce((acc, request) => {
    const userId = request.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        user_id: userId,
        user_name: request.user_name,
        user_email: request.user_email,
        requests: []
      };
    }
    acc[userId].requests.push(request);
    return acc;
  }, {} as Record<string, { user_id: string; user_name: string; user_email: string; requests: RequestWithApprovals[] }>);

  const staffRequests = Object.values(groupedRequests);

  const handleApprove = async (requestId: string, appName: string) => {
    try {
      setProcessing(true);
      await requestService.approveRequest(requestId, user?.name || 'Manager', '');
      
      // Refresh requests
      const requests = await requestService.getManagerRequests();
      setAllRequests(requests);
      
      showAlert(showSuccessAlert(
        'Request Approved',
        `Request for ${appName} has been approved successfully.`
      ));
      
      setSelectedAppRequest(null);
    } catch (error) {
      console.error('Error approving request:', error);
      showAlert(showErrorAlert(
        'Approval Failed',
        `Failed to approve request: ${error instanceof Error ? error.message : 'Unknown error'}`
      ));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId: string, appName: string) => {
    if (!rejectReason.trim()) {
      showAlert(showErrorAlert(
        'Rejection Reason Required',
        'Please provide a reason for rejecting this request.'
      ));
      return;
    }

    try {
      setProcessing(true);
      await requestService.rejectRequest(requestId, user?.name || 'Manager', rejectReason);
      
      // Refresh requests
      const requests = await requestService.getManagerRequests();
      setAllRequests(requests);
      
      showAlert(showSuccessAlert(
        'Request Rejected',
        `Request for ${appName} has been rejected.`
      ));
      
    setShowRejectModal(false);
      setSelectedAppRequest(null);
    setRejectReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      showAlert(showErrorAlert(
        'Rejection Failed',
        `Failed to reject request: ${error instanceof Error ? error.message : 'Unknown error'}`
      ));
    } finally {
      setProcessing(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to determine approval status based on level and current level
  const getApprovalStatus = (approval: any, currentLevel: number, requestStatus: string) => {
    // If request is already approved or rejected, show final status
    if (requestStatus === 'approved' || requestStatus === 'rejected') {
      return approval.status;
    }
    
    if (approval.status === 'approved') return 'approved';
    if (approval.status === 'rejected') return 'rejected';
    
    // For pending approvals, check if it's current level or waiting
    if (approval.level === currentLevel) {
      return 'need approval'; // This manager needs to act now
    } else if (approval.level > currentLevel) {
      return 'still waiting'; // Future approval levels
    } else {
      return 'pending'; // Should not happen in normal flow
    }
  };

  // Check if current manager can approve/reject this request
  const canManagerAct = (request: any) => {
    const currentUser = user;
    if (!currentUser) return false;
    
    // If request is already completed, no one can act
    if (request.status === 'approved' || request.status === 'rejected') {
      return false;
    }

    // Check if current manager is in the approval workflow
    const currentManagerApproval = request.approvals.find((a: any) => a.manager_name === currentUser.name);
    if (!currentManagerApproval) {
      return false;
    }

    // Check if current manager's approval is still pending
    if (currentManagerApproval.status !== 'pending') {
      return false;
    }

    // For No leveling applications, if manager is assigned, they can approve directly
    // For Leveling applications, check sequential approval
    const isLevelingApp = request.approvals.length > 1; // More than 1 approval level = Leveling app
    
    if (!isLevelingApp) {
      // No leveling app - manager can approve if they are assigned and pending
      return true;
    }

    // Leveling app - check sequential approval
    // Determine current manager level
    let managerLevel = 1;
    if (currentUser.email === 'manager.a@gmail.com') managerLevel = 1;
    else if (currentUser.email === 'manager.b@gmail.com') managerLevel = 2;
    else if (currentUser.email === 'manager.c@gmail.com') managerLevel = 3;
    else return false; // Not a recognized manager

    // Check if it's this manager's turn
    return request.current_level === managerLevel;
  };

  // Get manager level from email
  const getManagerLevel = (email: string) => {
    if (email === 'manager.a@gmail.com') return 1;
    if (email === 'manager.b@gmail.com') return 2;
    if (email === 'manager.c@gmail.com') return 3;
    return 0;
  };

  // Get pending counts for stats
  const pendingCount = allRequests.filter(r => r.status === 'pending').length;
  const approvedCount = allRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = allRequests.filter(r => r.status === 'rejected').length;

  // Detail view when app is selected
  if (selectedAppRequest) {
    const staff = staffRequests.find(s => s.user_id === selectedAppRequest.user_id);
    const request = staff?.requests.find(r => r.id === selectedAppRequest.requestId);
    
    if (!request) {
      return null; // Should not happen if selectedAppRequest is valid
    }

    return (
      <div className="min-h-screen">
          {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mx-8 mb-8">
            <div className="flex items-center space-x-4">
              <button
              onClick={() => setSelectedAppRequest(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-semibold">
                {getUserInitials(request.user_name)}
              </span>
            </div>
              <div>
              <h1 className="text-2xl font-bold text-gray-900">{request.application_name} Access Request</h1>
              <p className="text-gray-600">Request by {request.user_name} • {request.user_email}</p>
            </div>
            </div>
          </div>

          {/* Request Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mx-8">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Staff Name:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {getUserInitials(request.user_name)}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{request.user_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <span className="text-sm font-semibold text-gray-900">{request.user_email}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Application:</span>
                      <span className="text-sm font-semibold text-gray-900">{request.application_name}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Request Date:</span>
                      <span className="text-sm font-semibold text-gray-900">{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Reason for Access</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{request.business_justification}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Manager Action Required</h3>
                  
                  {!canManagerAct(request) ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-800">
                          {request.status === 'approved' ? 'Request Completed' :
                           request.status === 'rejected' ? 'Request Rejected' :
                           getManagerLevel(user?.email || '') > request.current_level ? 
                             'Waiting for Previous Manager' : 'Not Your Turn Yet'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">
                        {request.status === 'approved' ? 'This request has been fully approved by all managers.' :
                         request.status === 'rejected' ? 'This request was rejected and cannot be processed further.' :
                         getManagerLevel(user?.email || '') > request.current_level ? 
                           `Currently waiting for Manager ${request.current_level === 1 ? 'A' : request.current_level === 2 ? 'B' : 'C'} to approve.` :
                           `This request is not yet ready for your approval level.`}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Your Approval Required</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-2">
                        As Manager {getManagerLevel(user?.email || '') === 1 ? 'A' : getManagerLevel(user?.email || '') === 2 ? 'B' : 'C'}, 
                        this request requires your approval to grant access to {request.application_name}.
                      </p>
                    </div>
                  )}

                  {canManagerAct(request) && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(request.id, request.application_name)}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
                        disabled={processing}
                      >
                        {processing ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
            </div>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 inline mr-2" />
                            Approve Request
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
                        disabled={processing}
                      >
                        <XCircle className="h-4 w-4 inline mr-2" />
                        Reject Request
                      </button>
          </div>
                  )}

                  {/* Sequential Approval Progress */}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Approval Workflow Progress</h4>
            <div className="space-y-3">
                      {request.approvals
                        .sort((a, b) => a.level - b.level)
                        .map((approval, index) => {
                          const status = getApprovalStatus(approval, request.current_level, request.status);
                          const isCurrentManager = user?.email === 
                            (approval.level === 1 ? 'manager.a@gmail.com' : 
                             approval.level === 2 ? 'manager.b@gmail.com' : 'manager.c@gmail.com');
                          
                          return (
                            <div key={approval.level} className="relative">
                              <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
                                status === 'approved' ? 'bg-green-50 border-green-200' :
                                status === 'rejected' ? 'bg-red-50 border-red-200' :
                                status === 'need approval' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-gray-50 border-gray-200'
                              }`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                  status === 'approved' ? 'bg-green-500' :
                                  status === 'rejected' ? 'bg-red-500' :
                                  status === 'need approval' ? 'bg-yellow-500' :
                                  'bg-gray-400'
                                }`}>
                                  {status === 'approved' ? '✓' : 
                                   status === 'rejected' ? '✗' : 
                                   status === 'need approval' ? '⏳' : 
                                   approval.level === 1 ? 'A' : approval.level === 2 ? 'B' : 'C'}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 flex items-center">
                                    {approval.manager_name}
                                    {isCurrentManager && (
                                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        You
                  </span>
                                    )}
                                  </p>
                                  <p className={`text-sm font-medium ${
                                    status === 'approved' ? 'text-green-600' :
                                    status === 'rejected' ? 'text-red-600' :
                                    status === 'need approval' ? 'text-yellow-600' :
                                    'text-gray-500'
                                  }`}>
                                    {status === 'need approval' ? 'Waiting for approval' :
                                     status === 'still waiting' ? 'Still waiting' :
                                     status.charAt(0).toUpperCase() + status.slice(1)}
                                  </p>
                                  {approval.approved_at && (
                                    <p className="text-xs text-gray-500">
                                      Approved on {new Date(approval.approved_at).toLocaleDateString()}
                                    </p>
                                  )}
                                  {approval.rejected_at && (
                                    <p className="text-xs text-gray-500">
                                      Rejected on {new Date(approval.rejected_at).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                {/* Progress connector line */}
                                {index < request.approvals.length - 1 && (
                                  <div className={`absolute left-8 top-12 w-0.5 h-6 ${
                                    status === 'approved' ? 'bg-green-300' : 'bg-gray-300'
                                  }`}></div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Request</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this access request.
              </p>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(request.id, request.application_name)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={processing}
                >
                  Reject
                </button>
              </div>
              </div>
            </div>
          )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
        {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mx-8 mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Access Requests</h1>
            <p className="text-gray-600">Review and approve access requests from your team</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mx-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 mb-2 font-medium">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-700">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
              <div>
              <p className="text-sm text-green-600 mb-2 font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-700">{approvedCount}</p>
              </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
              </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
              <div>
              <p className="text-sm text-red-600 mb-2 font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-700">{rejectedCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
                  </div>

      {/* Staff Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mx-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Staff Requests</h2>
                  </div>
        <div className="p-6">
          {loadingRequests ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading requests...</p>
                </div>
          ) : staffRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No access requests found.</p>
              </div>
          ) : (
            <div className="space-y-3">
              {staffRequests.map((staff) => {
                const isExpanded = expandedStaff[staff.user_id];
                const pendingRequests = staff.requests.filter(r => r.status === 'pending');
                
                return (
                  <div key={staff.user_id}>
                    <div 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer"
                      onClick={() => setExpandedStaff(prev => ({ ...prev, [staff.user_id]: !isExpanded }))}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {getUserInitials(staff.user_name)}
                              </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{staff.user_name}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{staff.user_email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{staff.requests.length} request(s)</span>
                            {pendingRequests.length > 0 && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-yellow-600 font-medium">{pendingRequests.length} pending</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {staff.requests.some(r => canManagerAct(r)) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Action Required
                        </span>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
        </div>

                    {isExpanded && (
                      <div className="ml-6 mt-2 space-y-2">
                        {staff.requests.map((request) => (
                          <div 
                            key={request.id} 
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedAppRequest({ requestId: request.id, user_id: staff.user_id })}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                request.status === 'approved' ? 'bg-green-500' :
                                request.status === 'rejected' ? 'bg-red-500' :
                                canManagerAct(request) ? 'bg-yellow-500' : 'bg-gray-400'
                              }`}>
                                {request.application_name.charAt(0)}
                </div>
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-900">{request.application_name}</span>
                                  {canManagerAct(request) && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Your Turn
                                    </span>
                                  )}
                                  {request.status === 'pending' && !canManagerAct(request) && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                      Level {request.current_level}
                                    </span>
                                  )}
              </div>
                                <p className="text-xs text-gray-500">
                                  {new Date(request.created_at).toLocaleDateString()} • 
                                  {request.business_justification.substring(0, 50)}...
                </p>
              </div>
              </div>
              
              <div className="flex items-center space-x-3">
                              <div className="text-right text-xs text-gray-500">
                                {request.status === 'pending' && (
                                  <div>Progress: {request.approvals.filter(a => a.status === 'approved').length}/{request.total_levels}</div>
                                )}
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
                        ))}
          </div>
        )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {AlertComponent}
    </div>
  );
};

export default ManagerRequests;
