
import { useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  FileText,
  Activity,
  Calendar
} from 'lucide-react';
import ManagerRequests from './ManagerRequests';
import ManagerAppList from './ManagerAppList';
import ManagerCampaigns from './ManagerCampaigns';

interface ManagerDashboardProps {
  user: any;
}

const ManagerDashboard = ({ user }: ManagerDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data
  const mockRecentRequests = [
    {
      id: 1,
      user: 'John Doe',
      application: 'Salesforce CRM',
      status: 'waiting',
      requestDate: '2024-01-20',
      reason: 'Need access for customer data management',
      pendingApprover: user.name
    },
    {
      id: 2,
      user: 'Jane Smith',
      application: 'Jira Project Management',
      status: 'waiting',
      requestDate: '2024-01-19',
      reason: 'Required for project tracking',
      pendingApprover: user.name
    }
  ];

  const stats = {
    pendingApprovals: 8,
    approvedToday: 5,
    rejectedToday: 1,
    totalRequests: 45
  };

  if (activeTab === 'requests') {
    return <ManagerRequests onBack={() => setActiveTab('dashboard')} user={user} />;
  }

  if (activeTab === 'applist') {
    return <ManagerAppList onBack={() => setActiveTab('dashboard')} user={user} />;
  }

  if (activeTab === 'campaigns') {
    return <ManagerCampaigns onBack={() => setActiveTab('dashboard')} user={user} />;
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
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-blue-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-blue-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedToday}</p>
            </div>
          </div>
        </div>

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
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-lg border border-blue-100">
        <div className="px-6 py-4 border-b border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
        </div>
        <div className="divide-y divide-blue-50">
          {mockRecentRequests.map((request) => (
            <div key={request.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{request.user}</h3>
                    <p className="text-sm text-gray-500">{request.application}</p>
                    <p className="text-xs text-gray-400 mt-1">{request.reason}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">{new Date(request.requestDate).toLocaleDateString()}</span>
                  <button className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded hover:bg-green-200 transition-colors">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
