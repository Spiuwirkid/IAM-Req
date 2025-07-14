
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useOutletContext<{ user: any }>();

  // Mock data - in real app this would come from Supabase
  const mockRequests = [
    {
      id: 1,
      user: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      application: 'GNS3',
      status: 'waiting',
      requestDate: '2025-07-10',
      reason: 'Need access for network simulation and lab environment',
      approvers: [
        { name: 'Manager A', status: user?.name === 'Manager A' ? 'pending' : 'approved' },
        { name: 'Manager B', status: user?.name === 'Manager B' ? 'pending' : 'waiting' },
        { name: 'Manager C', status: user?.name === 'Manager C' ? 'pending' : 'waiting' }
      ]
    },
    {
      id: 2,
      user: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b050?w=150&h=150&fit=crop&crop=face',
      application: 'Visual Studio',
      status: 'waiting',
      requestDate: '2025-07-08',
      reason: 'Required for software development and coding projects',
      approvers: [
        { name: 'Manager A', status: user?.name === 'Manager A' ? 'pending' : 'waiting' }
      ]
    },
    {
      id: 3,
      user: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      application: 'Ubuntu Server',
      status: 'approved',
      requestDate: '2025-06-18',
      reason: 'Need SSH access for server administration and maintenance',
      approvers: [
        { name: 'Manager A', status: 'approved' },
        { name: 'Manager B', status: 'approved' }
      ]
    }
  ];

  const stats = {
    pending: mockRequests.filter(r => r.approvers.some(a => a.name === user?.name && a.status === 'pending')).length,
    approved: mockRequests.filter(r => r.approvers.some(a => a.name === user?.name && a.status === 'approved')).length,
    rejected: mockRequests.filter(r => r.approvers.some(a => a.name === user?.name && a.status === 'rejected')).length,
    total: mockRequests.length
  };

  const canApprove = (request: any) => {
    return request.approvers.some(approver => 
      approver.name === user?.name && approver.status === 'pending'
    );
  };

  return (
    <div className="min-h-screen">
      {/* Welcome Header - Direct on Background */}
      <div className="px-8 py-12">
        <div style={{ color: '#002A58' }}>
          <div className="text-4xl font-bold leading-tight">
            <div>WELCOME</div>
            <div>TO MANAGER DASHBOARD</div>
          </div>
          <div className="text-lg mt-4 tracking-wider font-medium">
            MANAGE ACCESS REQUESTS AND APPLICATIONS
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 mx-8">
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
              <p className="text-sm text-red-600 mb-2 font-medium">Rejected</p>
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
            <h2 className="text-xl font-semibold text-gray-800">Recent Access Requests</h2>
            <button className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
              View All Requests
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {mockRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No requests yet</h3>
              <p className="text-gray-600 mb-6">Access requests will appear here when submitted</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <div className="flex items-center space-x-4">
                    <img 
                      src={request.avatar} 
                      alt={request.user}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{request.user}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-600">{request.application}</span>
                      </div>
                      <p className="text-sm text-gray-500">{request.requestDate}</p>
                      {canApprove(request) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                          Requires your approval
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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

export default ManagerDashboard;
