
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
  Calendar
} from 'lucide-react';
import ITAdminRequests from './ITAdminRequests';
import ITAdminAppList from './ITAdminAppList';
import ITAdminCampaigns from './ITAdminCampaigns';

interface ITAdminDashboardProps {
  user: any;
}

const ITAdminDashboard = ({ user }: ITAdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data - in real app this would come from Supabase
  const mockRecentRequests = [
    {
      id: 1,
      user: 'John Doe',
      application: 'Salesforce CRM',
      status: 'waiting',
      requestDate: '2024-01-20',
      reason: 'Need access for customer data management'
    },
    {
      id: 2,
      user: 'Jane Smith',
      application: 'Jira Project Management',
      status: 'approved',
      requestDate: '2024-01-19',
      reason: 'Required for project tracking'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      application: 'AWS Console',
      status: 'rejected',
      requestDate: '2024-01-18',
      reason: 'Cloud infrastructure access'
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
    <div className="space-y-8">
      {/* Navigation */}
      <div className="bg-white rounded-lg border border-blue-100">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Requests
          </button>
          <button
            onClick={() => setActiveTab('applist')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'applist'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            App List
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'campaigns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Campaigns
          </button>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-blue-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-blue-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-blue-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Apps</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-blue-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg border border-blue-100">
        <div className="px-6 py-4 border-b border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent User Requests</h2>
        </div>
        <div className="divide-y divide-blue-50">
          {mockRecentRequests.map((request) => (
            <div key={request.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{request.user}</h3>
                    <p className="text-sm text-gray-500">{request.application}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">{new Date(request.requestDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ITAdminDashboard;
