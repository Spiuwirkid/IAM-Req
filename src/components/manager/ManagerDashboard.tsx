
import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  Activity,
  ArrowRight,
  User
} from 'lucide-react';
import { requestService, type RequestWithApprovals } from '../../services/requestService';

const ManagerDashboard = () => {
  const { user } = useOutletContext<{ user: any }>();
  const navigate = useNavigate();
  const [allRequests, setAllRequests] = useState<RequestWithApprovals[]>([]);
  const [myPendingRequests, setMyPendingRequests] = useState<RequestWithApprovals[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [stats, setStats] = useState({
    myPending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  // Get manager level from email
  const getManagerLevel = (email: string) => {
    if (email === 'manager.a@gmail.com') return 1;
    if (email === 'manager.b@gmail.com') return 2;
    if (email === 'manager.c@gmail.com') return 3;
    return 0;
  };

  // Check if request needs this manager's attention
  const needsMyAttention = (request: RequestWithApprovals) => {
    const myLevel = getManagerLevel(user?.email || '');
    if (myLevel === 0) return false;
    
    // Only show requests where it's my turn to approve
    return request.status === 'pending' && request.current_level === myLevel;
  };

  useEffect(() => {
    const loadManagerData = async () => {
      try {
        setLoadingRequests(true);
        
        // Get all requests for manager to review
        const allRequestsData = await requestService.getAllRequests();
        setAllRequests(allRequestsData);
        
        const myLevel = getManagerLevel(user?.email || '');
        
        // Filter requests that need my attention
        const requestsNeedingMyAction = allRequestsData.filter(needsMyAttention);
        setMyPendingRequests(requestsNeedingMyAction);
        
        // Calculate stats based on my involvement
        const myApprovedRequests = allRequestsData.filter(request => 
          request.approvals.some(approval => 
            approval.level === myLevel && approval.status === 'approved'
          )
        );
        
        const myRejectedRequests = allRequestsData.filter(request => 
          request.approvals.some(approval => 
            approval.level === myLevel && approval.status === 'rejected'
          )
        );
        
        setStats({
          myPending: requestsNeedingMyAction.length,
          approved: myApprovedRequests.length,
          rejected: myRejectedRequests.length,
          total: allRequestsData.length
        });
        
      } catch (error) {
        console.error('Error loading manager dashboard data:', error);
        setMyPendingRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    };

    loadManagerData();
  }, [user]);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getManagerLevelName = (level: number) => {
    switch (level) {
      case 1: return 'Manager A';
      case 2: return 'Manager B';
      case 3: return 'Manager C';
      default: return 'Manager';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Welcome Header - Direct on Background */}
      <div className="px-8 py-12">
        <div style={{ color: '#002A58' }}>
          <div className="text-4xl font-bold leading-tight">
            <div>WELCOME</div>
            <div>{getManagerLevelName(getManagerLevel(user?.email || ''))}</div>
          </div>
          <div className="text-lg mt-4 tracking-wider font-medium">
            MANAGE ACCESS REQUESTS AND APPLICATIONS
          </div>
          <div className="text-sm mt-2 text-gray-600">
            Approval Level: {getManagerLevel(user?.email || '')} • 
            {stats.myPending > 0 ? ` ${stats.myPending} request${stats.myPending > 1 ? 's' : ''} awaiting your approval` : ' No pending requests'}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 mx-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 mb-2 font-medium">Need My Approval</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.myPending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-2 font-medium">I Approved</p>
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
              <p className="text-sm text-red-600 mb-2 font-medium">I Rejected</p>
              <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

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
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mx-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Requests Awaiting Your Approval ({stats.myPending})
            </h2>
            <button
              onClick={() => navigate('/manager/requests')}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              View All Requests
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loadingRequests ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Loading requests...</h3>
              <p className="text-gray-600 mb-6">Please wait while we fetch the latest requests.</p>
            </div>
          ) : myPendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No requests awaiting your approval</h3>
              <p className="text-gray-600 mb-6">
                All requests at your approval level ({getManagerLevelName(getManagerLevel(user?.email || ''))}) have been processed
              </p>
              <button
                onClick={() => navigate('/manager/requests')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Requests
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myPendingRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer"
                  onClick={() => navigate('/manager-dashboard/requests')}
                >
                    <div className="flex items-center space-x-4">
                    {request.application_logo ? (
                      <img 
                        src={request.application_logo} 
                        alt={request.application_name}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center border-2 border-white shadow-sm">
                        <span className="text-white text-sm font-semibold">
                          {request.application_name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{request.user_name}</span>
                          <span className="text-gray-400">→</span>
                        <span className="text-gray-600">{request.application_name}</span>
                        </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500">{new Date(request.created_at).toLocaleDateString()}</p>
                        <span className="text-gray-400">•</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Level {request.current_level} Approval Required
                          </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">
                        Progress: {request.approvals.filter(a => a.status === 'approved').length}/{request.total_levels}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge('pending')}`}>
                        Needs Your Action
                      </span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
              
              {myPendingRequests.length > 5 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => navigate('/manager/requests')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View {myPendingRequests.length - 5} more requests →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
