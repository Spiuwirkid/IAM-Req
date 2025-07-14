
import { ArrowLeft, Clock, CheckCircle, XCircle, ChevronRight, Calendar, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { requestService, type RequestWithApprovals } from '../../services/requestService';

const StaffRequests = () => {
  const { user } = useOutletContext<{ user: any }>();
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [realRequests, setRealRequests] = useState<RequestWithApprovals[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [deletingRequest, setDeletingRequest] = useState<string | null>(null);

  // Load real requests from database
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoadingRequests(true);
        // Mock user ID - in real app this would come from auth
        const requests = await requestService.getUserRequests('staff_user_1');
        setRealRequests(requests);
      } catch (error) {
        console.error('Error loading requests:', error);
        setRealRequests([]); // Set empty array on error
      } finally {
        setLoadingRequests(false);
      }
    };

    loadRequests();
  }, []);

  // Handle delete request
  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeletingRequest(requestId);
      await requestService.deleteRequest(requestId);
      
      // Refresh the requests list
      const requests = await requestService.getUserRequests('staff_user_1');
      setRealRequests(requests);
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
    } finally {
      setDeletingRequest(null);
    }
  };

  // Helper function to determine approval status based on level and current level
  const getApprovalStatus = (approval: any, currentLevel: number) => {
    if (approval.status === 'approved') return 'approved';
    if (approval.status === 'rejected') return 'rejected';
    
    // For pending approvals, check if it's current level or waiting
    if (approval.level === currentLevel) {
      return 'need approval';
    } else if (approval.level > currentLevel) {
      return 'still waiting';
    } else {
      return 'pending'; // This shouldn't happen in normal flow
    }
  };

  // Transform real requests for display
  const displayRequests = realRequests.map(req => ({
    id: req.id,
    application: req.application_name,
    logo: req.application_logo,
    status: req.status === 'pending' ? 'waiting' : req.status,
    actualStatus: req.status, // Keep the actual status for delete logic
    requestDate: new Date(req.created_at).toISOString().split('T')[0],
    approvedDate: req.status === 'approved' ? new Date(req.updated_at).toISOString().split('T')[0] : null,
    rejectedDate: req.status === 'rejected' ? new Date(req.updated_at).toISOString().split('T')[0] : null,
    reason: req.business_justification,
    rejectionReason: req.rejection_reason || null,
    approvers: req.approvals
      .sort((a, b) => a.level - b.level) // Sort by level
      .map(approval => ({
        name: approval.manager_name,
        status: getApprovalStatus(approval, req.current_level),
        date: approval.approved_at ? new Date(approval.approved_at).toISOString().split('T')[0] : null,
        comment: approval.comments
      }))
  }));

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'waiting':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getApprovalProgress = (approvers: any[]) => {
    const total = approvers.length;
    const approved = approvers.filter(a => a.status === 'approved').length;
    const rejected = approvers.filter(a => a.status === 'rejected').length;
    
    if (rejected > 0) return { percentage: 100, color: 'bg-red-500', status: 'rejected' };
    if (approved === total) return { percentage: 100, color: 'bg-green-500', status: 'approved' };
    return { percentage: (approved / total) * 100, color: 'bg-blue-500', status: 'in-progress' };
  };

  if (loadingRequests) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedRequest) {
    const progress = getApprovalProgress(selectedRequest.approvers);
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-xl border-2 border-gray-100 flex items-center justify-center p-3 shadow-sm">
                    {selectedRequest.logo ? (
                      <img 
                        src={selectedRequest.logo}
                        alt={selectedRequest.application}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-medium">
                          {selectedRequest.application.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="w-10 h-10 bg-gray-200 rounded-lg hidden"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedRequest.application}</h1>
                    <div className="flex items-center space-x-3">
                      <span className={getStatusBadge(selectedRequest.status)}>
                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Requested on {selectedRequest.requestDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delete Button in Header */}
              {selectedRequest.actualStatus === 'pending' && (
                <button
                  onClick={() => handleDeleteRequest(selectedRequest.id)}
                  disabled={deletingRequest === selectedRequest.id}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {deletingRequest === selectedRequest.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Request
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Request Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  Request Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Business Justification</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                      <p className="text-gray-900">{selectedRequest.reason}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Request Date</label>
                      <p className="text-gray-900 mt-1 font-medium">{selectedRequest.requestDate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        <span className={getStatusBadge(selectedRequest.status)}>
                          {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedRequest.approvedDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Approved Date</label>
                      <p className="text-green-600 mt-1 font-medium">{selectedRequest.approvedDate}</p>
                    </div>
                  )}
                  {selectedRequest.rejectedDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Rejected Date</label>
                      <p className="text-red-600 mt-1 font-medium">{selectedRequest.rejectedDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rejection Reason */}
            {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
              <div className="bg-white rounded-xl shadow-sm border border-red-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    Rejection Reason
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{selectedRequest.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Approval Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                    Approval Progress
                  </h3>
                  <span className="text-sm text-gray-600 font-medium">
                    {selectedRequest.approvers.filter(a => a.status === 'approved').length} of {selectedRequest.approvers.length}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progress.percentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${progress.color}`}
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Approval Steps */}
                <div className="space-y-3">
                  {selectedRequest.approvers.map((approver, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          approver.status === 'approved' ? 'bg-green-500' :
                          approver.status === 'rejected' ? 'bg-red-500' :
                          approver.status === 'need approval' ? 'bg-blue-500' :
                          'bg-gray-400'
                        }`}>
                          {approver.status === 'approved' ? '✓' : 
                           approver.status === 'rejected' ? '✗' : 
                           approver.status === 'need approval' ? '⏳' : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{approver.name}</p>
                          <p className={`text-sm font-medium ${
                            approver.status === 'approved' ? 'text-green-600' :
                            approver.status === 'rejected' ? 'text-red-600' :
                            approver.status === 'need approval' ? 'text-blue-600' :
                            'text-gray-500'
                          }`}>
                            {approver.status === 'need approval' ? 'Waiting for approval' :
                             approver.status === 'still waiting' ? 'Still waiting' :
                             approver.status.charAt(0).toUpperCase() + approver.status.slice(1)}
                          </p>
                        </div>
                        {approver.date && (
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{approver.date}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
      <div className="bg-white rounded-xl border border-blue-100 p-6">
          <div className="flex items-center space-x-4">
            <button
            onClick={() => navigate('/staff')}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </button>
            <div>
            <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
            <p className="text-gray-600">View and track your access requests</p>
          </div>
        </div>
              </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-blue-100 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{displayRequests.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
              </div>
        <div className="bg-white rounded-xl border border-blue-100 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
                  {displayRequests.filter(r => r.status === 'approved').length}
                </p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
              </div>
        <div className="bg-white rounded-xl border border-blue-100 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
                  {displayRequests.filter(r => r.status === 'waiting').length}
                </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
              </div>
        <div className="bg-white rounded-xl border border-blue-100 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
                  {displayRequests.filter(r => r.status === 'rejected').length}
                </p>
            <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>

        {/* Requests List */}
      <div className="bg-white rounded-xl border border-blue-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Request History</h2>
          </div>
        
        {displayRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No requests yet</h3>
            <p className="text-gray-600 mb-6">Start by requesting access to applications you need</p>
            <button
              onClick={() => navigate('/staff/catalog')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Applications
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayRequests.map((request) => (
              <div 
                key={request.id} 
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
                    {request.logo ? (
                      <img 
                        src={request.logo}
                        alt={request.application}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs font-medium">
                          {request.application.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="w-8 h-8 bg-gray-200 rounded hidden"></div>
                  </div>
                    <div>
                    <h3 className="font-semibold text-gray-900">{request.application}</h3>
                    <p className="text-sm text-gray-600">Requested on {request.requestDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={getStatusBadge(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffRequests;
