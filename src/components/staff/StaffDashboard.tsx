import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  LayoutGrid,
  FileText,
  Activity,
  TrendingUp,
  ArrowRight,
  Calendar,
  User
} from 'lucide-react';
import RequestDetails from './RequestDetails';
import { requestService, type RequestWithApprovals } from '../../services/requestService';

const StaffDashboard = () => {
  const { user } = useOutletContext<{ user: any }>();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [realRequests, setRealRequests] = useState<RequestWithApprovals[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const navigate = useNavigate();

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
        setRealRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    };

    loadRequests();
  }, []);

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
      return 'pending';
    }
  };

  // Transform real requests for display
  const displayRequests = realRequests.map(req => ({
    id: req.id,
    application: req.application_name,
    logo: req.application_logo,
    status: req.status === 'pending' ? 'waiting' : req.status,
    requestDate: new Date(req.created_at).toISOString().split('T')[0],
    approvedDate: req.status === 'approved' ? new Date(req.updated_at).toISOString().split('T')[0] : null,
    rejectedDate: req.status === 'rejected' ? new Date(req.updated_at).toISOString().split('T')[0] : null,
    reason: req.business_justification,
    rejectionReason: req.rejection_reason || null,
    isLeveling: req.total_levels > 1,
    approvers: req.approvals
      .sort((a, b) => a.level - b.level)
      .map(approval => ({
        name: approval.manager_name,
        status: getApprovalStatus(approval, req.current_level),
        date: approval.approved_at ? new Date(approval.approved_at).toISOString().split('T')[0] : null,
        comment: approval.comments
      }))
  }));

  const stats = {
    total: displayRequests.length,
    approved: displayRequests.filter(r => r.status === 'approved').length,
    pending: displayRequests.filter(r => r.status === 'waiting').length,
    rejected: displayRequests.filter(r => r.status === 'rejected').length
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "text-sm font-semibold";
    switch (status) {
      case 'approved':
        return `${baseClasses} text-emerald-700`;
      case 'waiting':
        return `${baseClasses} text-amber-700`;
      case 'rejected':
        return `${baseClasses} text-rose-700`;
      default:
        return `${baseClasses} text-slate-700`;
    }
  };

  const getSimpleApprovalStatus = (request: any) => {
    if (!request.isLeveling) {
      if (request.status === 'approved') {
        return { text: 'Approved', color: 'text-green-600' };
      }
      return { text: 'Single approval', color: 'text-blue-600' };
    }

    const approved = request.approvers.filter(a => a.status === 'approved').length;
    const total = request.approvers.length;
    const hasRejected = request.approvers.some(a => a.status === 'rejected');
    
    if (hasRejected) {
      return { text: 'Rejected by manager', color: 'text-red-600' };
    }
    
    if (approved === total) {
      return { text: 'All approved', color: 'text-green-600' };
    }
    
    return { text: `${approved}/${total} approved`, color: 'text-yellow-600' };
  };

  if (loadingRequests) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedRequest) {
    return (
      <RequestDetails 
        request={selectedRequest} 
        onBack={() => setSelectedRequest(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Welcome Header - Direct on Background */}
      <div className="px-8 py-12 mb-1">
        <div style={{ color: '#002A58' }}>
          <div className="text-4xl font-bold leading-tight">
            <div>WELCOME</div>
            <div>TO DASHBOARD</div>
          </div>
          <div className="text-lg mt-4 tracking-wider font-medium">
            LIST OF APPLICATION YOU REQUEST
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-2 font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-2 font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 mb-2 font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-2 font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* My Access Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">My Access Requests</h2>
            <button
              onClick={() => navigate('/staff/catalog')}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </button>
          </div>
        </div>

        <div className="p-6">
          {displayRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No requests yet</h3>
              <p className="text-gray-600 mb-6">Start by requesting access to applications you need</p>
              <button
                onClick={() => navigate('/staff/catalog')}
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Browse Applications
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayRequests.map((request) => {
                const approvalStatus = getSimpleApprovalStatus(request);
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
                        {request.logo ? (
                          <img 
                            src={request.logo}
                            alt={request.application}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-500 text-xs font-medium">
                              {request.application.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <Activity className={`h-5 w-5 text-blue-600 ${request.logo ? 'hidden' : ''}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{request.application}</h3>
                        <p className="text-sm text-gray-500">{request.requestDate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className={getStatusBadge(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        <p className={`text-sm ${approvalStatus.color}`}>
                          {approvalStatus.text}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
