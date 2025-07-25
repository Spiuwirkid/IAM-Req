
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Users,
  FileText,
  Activity,
  Calendar,
  ArrowRight,
  User
} from 'lucide-react';
import ITAdminRequests from './ITAdminRequests';
import ITAdminAppList from './ITAdminAppList';
import ITAdminCampaigns from './ITAdminCampaigns';
import { requestService, type RequestWithApprovals } from '../../services/requestService';

interface ITAdminDashboardProps {
  user: any;
}

const ITAdminDashboard = ({ user }: ITAdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recentRequests, setRecentRequests] = useState<RequestWithApprovals[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [systemStats, setSystemStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalApplications: 0,
    activeUsers: 0
  });

  useEffect(() => {
    const loadITAdminData = async () => {
      try {
        setLoadingRequests(true);
        
        // Get all requests for system overview
        const allRequests = await requestService.getAllRequests();
        
        // Get all applications
        const allApplications = await requestService.getApplications();
        
        // Get all campaigns
        const allCampaigns = await requestService.getCampaigns();
        
        // Calculate system stats
        const totalRequests = allRequests.length;
        const pendingRequests = allRequests.filter(r => r.status === 'pending').length;
        const approvedRequests = allRequests.filter(r => r.status === 'approved').length;
        const rejectedRequests = allRequests.filter(r => r.status === 'rejected').length;
        
        // Get unique users who made requests
        const uniqueUsers = new Set(allRequests.map(r => r.user_id));
        
        setSystemStats({
          totalRequests,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
          totalApplications: allApplications.length,
          activeUsers: uniqueUsers.size
        });

        // Get recent requests (last 5)
        const sortedRequests = allRequests
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        
        setRecentRequests(sortedRequests);
        
        console.log('✅ IT Admin dashboard data loaded successfully');
        
      } catch (error) {
        console.error('Error loading IT admin dashboard data:', error);
        setRecentRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    };

    loadITAdminData();
  }, []);

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

  if (activeTab === 'requests') {
    return <ITAdminRequests onBack={() => setActiveTab('dashboard')} user={user} />;
  }

  if (activeTab === 'applist') {
    return <ITAdminAppList onBack={() => setActiveTab('dashboard')} user={user} />;
  }

  if (activeTab === 'campaigns') {
    return <ITAdminCampaigns onBack={() => setActiveTab('dashboard')} user={user} />;
  }

  return (
    <div className="min-h-screen">
      {/* Welcome Header - Dark blue text directly on background */}
      <div className="px-8 py-12">
        <div style={{ color: '#002A58' }}>
          <div className="text-4xl font-bold leading-tight">
            <div>WELCOME</div>
            <div>TO IT ADMIN DASHBOARD</div>
          </div>
          <div className="text-lg mt-4 tracking-wider font-medium opacity-90">
            MONITOR AND MANAGE SYSTEM ACCESS
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 mx-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-2 font-medium">Total Requests</p>
              <p className="text-3xl font-bold text-blue-700">{systemStats.totalRequests}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 mb-2 font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-700">{systemStats.pendingRequests}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-2 font-medium">Total Apps</p>
              <p className="text-3xl font-bold text-green-700">{systemStats.totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-2 font-medium">Active Users</p>
              <p className="text-3xl font-bold text-purple-700">{systemStats.activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-lg mx-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Recent User Requests</h2>
            <button 
              onClick={() => setActiveTab('requests')}
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
          ) : recentRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No requests yet</h3>
              <p className="text-gray-600 mb-6">Access requests will appear here when submitted</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                      {getUserInitials(request.user_name)}
                  </div>
                  <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{request.user_name}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-600">{request.application_name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        <span className="text-gray-400">•</span>
                        <span>Level: {request.current_level}/{request.total_levels}</span>
                      </div>
                    </div>
                  </div>
                  
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                        {request.status === 'pending' ? 'Waiting' : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ITAdminDashboard;
