
import { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import ITAdminRequests from './ITAdminRequests';
import ITAdminAppList from './ITAdminAppList';
import ITAdminCampaigns from './ITAdminCampaigns';

interface ITAdminDashboardProps {
  user: any;
}

const ITAdminDashboard = ({ user }: ITAdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data with profile photos
  const mockRecentRequests = [
    {
      id: 1,
      user: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      application: 'GNS3',
      status: 'waiting',
      requestDate: '2025-07-10',
      reason: 'Need access for network simulation and lab environment',
      manager: 'Manager A'
    },
    {
      id: 2,
      user: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b050?w=150&h=150&fit=crop&crop=face',
      application: 'Visual Studio',
      status: 'approved',
      requestDate: '2025-07-08',
      reason: 'Required for software development and coding projects',
      manager: 'Manager B'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      application: 'Ubuntu Server',
      status: 'rejected',
      requestDate: '2025-06-18',
      reason: 'Need SSH access for server administration',
      manager: 'Manager C'
    }
  ];

  const stats = {
    totalRequests: 45,
    pendingRequests: 12,
    totalApps: 25,
    activeCampaigns: 3
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
              <p className="text-3xl font-bold text-blue-700">{stats.totalRequests}</p>
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
              <p className="text-3xl font-bold text-yellow-700">{stats.pendingRequests}</p>
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
              <p className="text-3xl font-bold text-green-700">{stats.totalApps}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-2 font-medium">Active Campaigns</p>
              <p className="text-3xl font-bold text-purple-700">{stats.activeCampaigns}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
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
          {mockRecentRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No requests yet</h3>
              <p className="text-gray-600 mb-6">Access requests will appear here when submitted</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockRecentRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <img 
                      src={request.avatar} 
                      alt={request.user}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{request.user}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-600">{request.application}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{request.requestDate}</span>
                        <span className="text-gray-400">•</span>
                        <span>Manager: {request.manager}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status === 'waiting' ? 'Waiting' : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
