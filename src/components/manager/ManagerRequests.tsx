
import { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Users } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Access Requests</h1>
          <p className="text-gray-600">Review and approve access requests</p>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg border border-blue-100">
        <div className="px-6 py-4 border-b border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900">Requests Requiring Your Review</h2>
        </div>
        <div className="divide-y divide-blue-50">
          {requests.map((request) => (
            <div key={request.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(request.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{request.user}</h3>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm text-gray-600">{request.application}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{request.reason}</p>
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-xs text-gray-500">
                        Requested on {new Date(request.requestDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Approval Status:</span>
                      {request.approvers.map((approver, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            approver.status === 'approved' ? 'bg-green-100 text-green-700' :
                            approver.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            approver.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {approver.name}: {approver.status}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {canApprove(request) && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded hover:bg-green-200 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectModal(true);
                        }}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Request</h3>
            <p className="text-sm text-gray-600 mb-4">
              You are about to reject the access request for <strong>{selectedRequest.user}</strong> to <strong>{selectedRequest.application}</strong>.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for rejection</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleReject(selectedRequest.id)}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerRequests;
