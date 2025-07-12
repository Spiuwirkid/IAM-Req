
import { ArrowLeft, Clock, CheckCircle, XCircle, Eye, Calendar, User, FileText, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface StaffRequestsProps {
  onBack: () => void;
  user: any;
}

const StaffRequests = ({ onBack, user }: StaffRequestsProps) => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

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

  if (selectedRequest) {
    const progress = getApprovalProgress(selectedRequest.approvers);
    
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
                  <span className={getStatusBadge(selectedRequest.status)}>
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600">Request Details</p>
              </div>
            </div>
          </div>

          {/* Request Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Reason for Request</label>
                <p className="text-gray-900 mt-1">{selectedRequest.reason}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Request Date</label>
                  <p className="text-gray-900 mt-1">{new Date(selectedRequest.requestDate).toLocaleDateString('id-ID', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                {selectedRequest.approvedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Approved Date</label>
                    <p className="text-green-600 mt-1">{new Date(selectedRequest.approvedDate).toLocaleDateString('id-ID', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                )}
                {selectedRequest.rejectedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rejected Date</label>
                    <p className="text-red-600 mt-1">{new Date(selectedRequest.rejectedDate).toLocaleDateString('id-ID', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Approval Progress */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Approval Progress</h3>
              <span className="text-sm text-gray-500">
                {selectedRequest.approvers.filter(a => a.status === 'approved').length} of {selectedRequest.approvers.length} managers approved
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${progress.color}`}
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedRequest.approvers.map((approver, index) => (
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
          {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-red-800 mb-2">Rejection Reason</h4>
                <p className="text-sm text-red-700">{selectedRequest.rejectionReason}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
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
              <p className="text-gray-600 mt-1">Click on any application to view detailed status</p>
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
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100">
          <div className="px-6 py-4 border-b border-blue-100">
            <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
          </div>
          <div className="divide-y divide-blue-50">
            {mockRequests.map((request) => (
              <div 
                key={request.id} 
                className="px-6 py-4 hover:bg-blue-25 cursor-pointer transition-colors"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.application}</h3>
                      <p className="text-sm text-gray-500">
                        Requested on {new Date(request.requestDate).toLocaleDateString('id-ID', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={getStatusBadge(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffRequests;
