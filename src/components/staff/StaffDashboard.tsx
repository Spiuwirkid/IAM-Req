
import { useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Apps,
  FileText,
  Activity
} from 'lucide-react';
import AppCatalog from './AppCatalog';
import RequestDetails from './RequestDetails';

interface StaffDashboardProps {
  user: any;
}

const StaffDashboard = ({ user }: StaffDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Mock data - in real app this would come from Supabase
  const mockRequests = [
    {
      id: 1,
      application: 'Salesforce CRM',
      status: 'approved',
      requestDate: '2024-01-15',
      approvedDate: '2024-01-16',
      reason: 'Need access for customer data management',
      approvers: [
        { name: 'Manager A', status: 'approved', date: '2024-01-16' },
        { name: 'Manager B', status: 'approved', date: '2024-01-16' }
      ]
    },
    {
      id: 2,
      application: 'Jira Project Management',
      status: 'waiting',
      requestDate: '2024-01-18',
      reason: 'Required for project tracking and bug management',
      approvers: [
        { name: 'Manager A', status: 'approved', date: '2024-01-18' },
        { name: 'Manager B', status: 'pending', date: null }
      ]
    },
    {
      id: 3,
      application: 'AWS Console',
      status: 'rejected',
      requestDate: '2024-01-10',
      rejectedDate: '2024-01-12',
      reason: 'Need access for cloud infrastructure management',
      rejectionReason: 'Insufficient business justification',
      approvers: [
        { name: 'Manager A', status: 'rejected', date: '2024-01-12' }
      ]
    }
  ];

  const stats = {
    total: mockRequests.length,
    approved: mockRequests.filter(r => r.status === 'approved').length,
    pending: mockRequests.filter(r => r.status === 'waiting').length,
    rejected: mockRequests.filter(r => r.status === 'rejected').length
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

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
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

  if (selectedRequest) {
    return (
      <RequestDetails 
        request={selectedRequest} 
        onBack={() => setSelectedRequest(null)} 
      />
    );
  }

  if (activeTab === 'catalog') {
    return (
      <AppCatalog 
        onBack={() => setActiveTab('dashboard')}
        user={user}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'catalog'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Apps className="h-4 w-4 inline mr-2" />
            App Catalog
          </button>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Access Requests</h2>
            <button
              onClick={() => setActiveTab('catalog')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          {mockRequests.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
              <p className="text-gray-600 mb-4">Start by requesting access to applications</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Browse Applications
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {mockRequests.map((request) => (
                <div key={request.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRequest(request)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(request.status)}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{request.application}</h3>
                        <p className="text-sm text-gray-600">Requested on {new Date(request.requestDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={getStatusBadge(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
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

export default StaffDashboard;
