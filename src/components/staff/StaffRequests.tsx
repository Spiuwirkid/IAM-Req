
import { ArrowLeft, Clock, CheckCircle, XCircle, Eye, Calendar, User, FileText } from 'lucide-react';

interface StaffRequestsProps {
  onBack: () => void;
  user: any;
}

const StaffRequests = ({ onBack, user }: StaffRequestsProps) => {
  // Mock data dengan status yang lebih detail
  const mockRequests = [
    {
      id: 1,
      application: 'Salesforce CRM',
      status: 'approved',
      requestDate: '2024-01-15',
      approvedDate: '2024-01-16',
      reason: 'Need access for customer data management and maintaining client relationships',
      approvers: [
        { name: 'Manager A', status: 'approved', date: '2024-01-16', comment: 'Approved for customer management role' },
        { name: 'Manager B', status: 'approved', date: '2024-01-16', comment: 'Access granted' }
      ]
    },
    {
      id: 2,
      application: 'Jira Project Management',
      status: 'waiting',
      requestDate: '2024-01-18',
      reason: 'Required for project tracking and bug management for upcoming product release',
      approvers: [
        { name: 'Manager A', status: 'approved', date: '2024-01-18', comment: 'Approved for project management tasks' },
        { name: 'Manager B', status: 'pending', date: null, comment: null }
      ]
    },
    {
      id: 3,
      application: 'AWS Console',
      status: 'rejected',
      requestDate: '2024-01-10',
      rejectedDate: '2024-01-12',
      reason: 'Need access for cloud infrastructure management and deployment tasks',
      rejectionReason: 'Insufficient business justification - access level too high for current role',
      approvers: [
        { name: 'Manager A', status: 'rejected', date: '2024-01-12', comment: 'Requires additional security training first' }
      ]
    },
    {
      id: 4,
      application: 'Tableau Analytics',
      status: 'waiting',
      requestDate: '2024-01-20',
      reason: 'Need access for data visualization and business intelligence reporting',
      approvers: [
        { name: 'Manager A', status: 'pending', date: null, comment: null }
      ]
    }
  ];

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

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
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

  const getApprovalProgress = (approvers: any[]) => {
    const total = approvers.length;
    const approved = approvers.filter(a => a.status === 'approved').length;
    const rejected = approvers.filter(a => a.status === 'rejected').length;
    
    if (rejected > 0) return { percentage: 100, color: 'bg-red-500', status: 'rejected' };
    if (approved === total) return { percentage: 100, color: 'bg-green-500', status: 'approved' };
    return { percentage: (approved / total) * 100, color: 'bg-blue-500', status: 'in-progress' };
  };

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
              <h1 className="text-3xl font-bold text-gray-900">My Access Requests</h1>
              <p className="text-gray-600 mt-1">Track the status of your application access requests</p>
            </div>
          </div>
        </div>

        {/* Request Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{mockRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {mockRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Clock className="h-7 w-7 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {mockRequests.filter(r => r.status === 'waiting').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center">
                <XCircle className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">
                  {mockRequests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {mockRequests.map((request) => {
            const progress = getApprovalProgress(request.approvers);
            return (
              <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
                {/* Request Header */}
                <div className="p-6 border-b border-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getStatusIcon(request.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{request.application}</h3>
                          <span className={getStatusBadge(request.status)}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4 leading-relaxed">{request.reason}</p>
                        
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Requested: {new Date(request.requestDate).toLocaleDateString('id-ID', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          {request.approvedDate && (
                            <div className="flex items-center space-x-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>Approved: {new Date(request.approvedDate).toLocaleDateString('id-ID', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                          )}
                          {request.rejectedDate && (
                            <div className="flex items-center space-x-2 text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span>Rejected: {new Date(request.rejectedDate).toLocaleDateString('id-ID', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Approval Progress */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Approval Progress</h4>
                    <span className="text-sm text-gray-500">
                      {request.approvers.filter(a => a.status === 'approved').length} of {request.approvers.length} managers approved
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${progress.color}`}
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Approvers Status */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Manager Reviews</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {request.approvers.map((approver, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                              approver.status === 'approved' ? 'bg-green-100 text-green-700' :
                              approver.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {approver.status === 'approved' ? '✓' : 
                               approver.status === 'rejected' ? '✗' : '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{approver.name}</p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                approver.status === 'approved' ? 'bg-green-100 text-green-800' :
                                approver.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {approver.status.charAt(0).toUpperCase() + approver.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {approver.comment && (
                          <p className="text-sm text-gray-600 mb-2 bg-white p-3 rounded-lg">{approver.comment}</p>
                        )}
                        
                        {approver.date && (
                          <p className="text-xs text-gray-500">
                            {approver.status} on {new Date(approver.date).toLocaleDateString('id-ID', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rejection Reason */}
                {request.status === 'rejected' && request.rejectionReason && (
                  <div className="px-6 pb-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-red-800 mb-2">Rejection Reason</h4>
                      <p className="text-sm text-red-700">{request.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StaffRequests;
