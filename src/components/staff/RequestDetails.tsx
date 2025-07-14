
import { ArrowLeft, Calendar, User, MessageSquare, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface RequestDetailsProps {
  request: any;
  onBack: () => void;
}

const RequestDetails = ({ request, onBack }: RequestDetailsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'waiting':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5" />;
      case 'waiting':
        return <Clock className="h-5 w-5" />;
      case 'rejected':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getApproverStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
          <p className="text-gray-600">Access request for {request.application}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Request Status</h2>
                <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-2 text-sm font-medium">
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>

              {request.status === 'rejected' && request.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Request Rejected</h3>
                      <p className="text-sm text-red-700 mt-1">{request.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Application:</span>
                  <span className="font-medium text-gray-900">{request.application}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Request Date:</span>
                  <span className="text-gray-900">{new Date(request.requestDate).toLocaleDateString()}</span>
                </div>
                {request.approvedDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Approved Date:</span>
                    <span className="text-gray-900">{new Date(request.approvedDate).toLocaleDateString()}</span>
                  </div>
                )}
                {request.rejectedDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Rejected Date:</span>
                    <span className="text-gray-900">{new Date(request.rejectedDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Justification */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Business Justification</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{request.reason}</p>
            </div>
          </div>

          {/* Approval Timeline */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Timeline</h2>
              <div className="space-y-4">
                {request.approvers.map((approver: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getApproverStatusIcon(approver.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{approver.name}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          approver.status === 'approved' ? 'bg-green-100 text-green-800' :
                          approver.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {approver.status.charAt(0).toUpperCase() + approver.status.slice(1)}
                        </span>
                      </div>
                      {approver.date && (
                        <p className="text-xs text-gray-500 mt-1">
                          {approver.status === 'approved' ? 'Approved' : 'Rejected'} on {new Date(approver.date).toLocaleDateString()}
                        </p>
                      )}
                      {approver.status === 'pending' && (
                        <p className="text-xs text-gray-500 mt-1">Pending approval</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Request ID:</span>
                  <span className="ml-auto font-mono text-gray-900">#{request.id.toString().padStart(6, '0')}</span>
                </div>
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Approvers:</span>
                  <span className="ml-auto text-gray-900">{request.approvers.length}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Days pending:</span>
                  <span className="ml-auto text-gray-900">
                    {Math.ceil((new Date().getTime() - new Date(request.requestDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {request.status === 'waiting' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    Send Reminder
                  </button>
                  <button className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm">
                    Cancel Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Need Help */}
          <div className="bg-blue-50 rounded-lg border border-blue-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-4">
                If you have questions about this request, contact your manager or IT support.
              </p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
