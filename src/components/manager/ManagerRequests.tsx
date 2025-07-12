
import { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Users, Calendar, MessageSquare, FileText, ChevronRight } from 'lucide-react';

interface ManagerRequestsProps {
  onBack: () => void;
  user: any;
}

const ManagerRequests = ({ onBack, user }: ManagerRequestsProps) => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      user: 'John Doe',
      application: 'Salesforce CRM',
      status: 'waiting',
      requestDate: '2024-01-20',
      reason: 'Need access for customer data management to handle new client accounts and maintain customer relationships',
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
      reason: 'Required for project tracking and bug management for upcoming product release',
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
    },
    {
      id: 4,
      user: 'Sarah Wilson',
      application: 'Tableau Analytics',
      status: 'waiting',
      requestDate: '2024-01-21',
      reason: 'Need access for data visualization and creating business reports',
      approvers: [
        { name: 'Manager A', status: user.name === 'Manager A' ? 'pending' : 'waiting' },
        { name: 'Manager C', status: user.name === 'Manager C' ? 'pending' : 'waiting' }
      ]
    },
    {
      id: 5,
      user: 'John Doe',
      application: 'Slack Premium',
      status: 'waiting',
      requestDate: '2024-01-22',
      reason: 'Need premium features for team communication and file sharing',
      approvers: [
        { name: 'Manager A', status: user.name === 'Manager A' ? 'pending' : 'waiting' }
      ]
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = (requestId: number) => {
    setRequests(requests.map(req => {
      if (req.id === requestId) {
        const updatedApprovers = req.approvers.map(approver => 
          approver.name === user.name ? { ...approver, status: 'approved' } : approver
        );
        const allApproved = updatedApprovers.every(approver => approver.status === 'approved');
        return {
          ...req,
          approvers: updatedApprovers,
          status: allApproved ? 'approved' : 'waiting'
        };
      }
      return req;
    }));
    setSelectedRequest(null);
  };

  const handleReject = (requestId: number) => {
    setRequests(requests.map(req => {
      if (req.id === requestId) {
        const updatedApprovers = req.approvers.map(approver => 
          approver.name === user.name ? { ...approver, status: 'rejected' } : approver
        );
        return {
          ...req,
          approvers: updatedApprovers,
          status: 'rejected'
        };
      }
      return req;
    }));
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectReason('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'waiting':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const canApprove = (request: any) => {
    return request.approvers.some(approver => 
      approver.name === user.name && approver.status === 'pending'
    );
  };

  const pendingRequests = requests.filter(req => canApprove(req));
  const completedRequests = requests.filter(req => !canApprove(req));

  // Group requests by user
  const groupedRequests = requests.reduce((acc, request) => {
    if (!acc[request.user]) {
      acc[request.user] = [];
    }
    acc[request.user].push(request);
    return acc;
  }, {} as Record<string, typeof requests>);

  if (selectedRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-3 hover:bg-blue-50 rounded-xl transition-colors border border-blue-100"
              >
                <ArrowLeft className="h-5 w-5 text-blue-600" />
              </button>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(selectedRequest.status)}
                  <h1 className="text-2xl font-bold text-gray-900">{selectedRequest.application}</h1>
                </div>
                <p className="text-gray-600">Request by {selectedRequest.user}</p>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Reason for Request</label>
                <p className="text-gray-900 mt-1">{selectedRequest.reason}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Requested by</label>
                  <p className="text-gray-900 mt-1">{selectedRequest.user}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Request Date</label>
                  <p className="text-gray-900 mt-1">{new Date(selectedRequest.requestDate).toLocaleDateString('id-ID', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Status</h3>
            <div className="space-y-3">
              {selectedRequest.approvers.map((approver, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{approver.name}</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    approver.status === 'approved' ? 'bg-green-100 text-green-800' :
                    approver.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    approver.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {approver.status.charAt(0).toUpperCase() + approver.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {canApprove(selectedRequest) && (
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Take Action</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Approve Request</span>
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="h-5 w-5" />
                  <span>Reject Request</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-3 hover:bg-blue-50 rounded-xl transition-colors border border-blue-100"
            >
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Access Requests</h1>
              <p className="text-gray-600 mt-1">Review and approve access requests from your team</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Clock className="h-7 w-7 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-blue-600">{requests.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests by User */}
        <div className="space-y-6">
          {Object.entries(groupedRequests).map(([userName, userRequests]) => (
            <div key={userName} className="bg-white rounded-2xl shadow-sm border border-blue-100">
              <div className="px-6 py-4 border-b border-blue-100 bg-blue-25">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{userName}</h3>
                    <p className="text-sm text-gray-600">{userRequests.length} request(s)</p>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-blue-50">
                {userRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="p-6 hover:bg-blue-25 cursor-pointer transition-colors"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        {getStatusIcon(request.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{request.application}</h4>
                            {canApprove(request) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Requires Your Approval
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.reason}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(request.requestDate).toLocaleDateString('id-ID', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {request.approvers.map((approver, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    approver.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    approver.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    approver.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {approver.name.split(' ')[1]}: {approver.status}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reject Modal */}
        {showRejectModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Reject Request</h3>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  You are about to reject the access request from <strong>{selectedRequest.user}</strong> for <strong>{selectedRequest.application}</strong>.
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for rejection</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a clear reason for rejection..."
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-3 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerRequests;
