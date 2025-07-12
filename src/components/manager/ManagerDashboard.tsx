
import { useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  FileText,
  LayoutGrid,
  Megaphone,
  TrendingUp,
  Activity
} from 'lucide-react';
import ManagerRequests from './ManagerRequests';
import ManagerAppList from './ManagerAppList';
import ManagerCampaigns from './ManagerCampaigns';

interface ManagerDashboardProps {
  user: any;
}

const ManagerDashboard = ({ user }: ManagerDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data - in real app this would come from Supabase
  const mockRequests = [
    {
      id: 1,
      user: 'John Doe',
      application: 'Salesforce CRM',
      status: 'waiting',
      requestDate: '2024-01-20',
      reason: 'Need access for customer data management',
      approvers: [
        { name: 'Manager A', status: user.name === 'Manager A' ? 'pending' : 'approved' },
        { name: 'Manager B', status: user.name === 'Manager B' ? 'pending' : 'waiting' }
      ]
    },
    {
      id: 2,
      user: 'Jane Smith',
      application: 'Jira Project Management',
      status: 'waiting',
      requestDate: '2024-01-19',
      reason: 'Required for project tracking and bug management',
      approvers: [
        { name: 'Manager A', status: user.name === 'Manager A' ? 'pending' : 'waiting' }
      ]
    },
    {
      id: 3,
      user: 'Mike Johnson',
      application: 'AWS Console',
      status: 'approved',
      requestDate: '2024-01-18',
      reason: 'Need access for cloud infrastructure management',
      approvers: [
        { name: 'Manager A', status: 'approved' },
        { name: 'Manager B', status: 'approved' }
      ]
    }
  ];

  const stats = {
    pending: mockRequests.filter(r => r.approvers.some(a => a.name === user.name && a.status === 'pending')).length,
    approved: mockRequests.filter(r => r.approvers.some(a => a.name === user.name && a.status === 'approved')).length,
    rejected: mockRequests.filter(r => r.approvers.some(a => a.name === user.name && a.status === 'rejected')).length,
    total: mockRequests.length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'waiting':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const canApprove = (request: any) => {
    return request.approvers.some(approver => 
      approver.name === user.name && approver.status === 'pending'
    );
  };

  if (activeTab === 'requests') {
    return (
      <ManagerRequests 
        onBack={() => setActiveTab('dashboard')}
        user={user}
      />
    );
  }

  if (activeTab === 'apps') {
    return (
      <ManagerAppList 
        onBack={() => setActiveTab('dashboard')}
        user={user}
      />
    );
  }

  if (activeTab === 'campaigns') {
    return (
      <ManagerCampaigns 
        onBack={() => setActiveTab('dashboard')}
        user={user}
      />
    );
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
            {stats.pending > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'apps'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <LayoutGrid className="h-4 w-4 inline mr-2" />
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
            <Megaphone className="h-4 w-4 inline mr-2" />
            Campaigns
          </button>
        </nav>
      </div>

      {/* Clean Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests - View Only */}
      <div className="bg-card rounded-xl border">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Access Requests</h2>
            <button
              onClick={() => setActiveTab('requests')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Requests →
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          {mockRequests.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No requests yet</h3>
              <p className="text-muted-foreground">Access requests will appear here when submitted</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {mockRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="px-6 py-4 hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(request.status)}
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{request.user}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm text-muted-foreground">{request.application}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Requested on {new Date(request.requestDate).toLocaleDateString()}</p>
                        {canApprove(request) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                            Requires your approval
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
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

export default ManagerDashboard;
