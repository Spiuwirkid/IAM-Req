
import { ArrowLeft, Clock, CheckCircle, XCircle, Users } from 'lucide-react';

interface ITAdminRequestsProps {
  onBack: () => void;
  user: any;
}

const ITAdminRequests = ({ onBack, user }: ITAdminRequestsProps) => {
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
        { name: 'Manager A', status: 'approved' },
        { name: 'Manager B', status: 'pending' }
      ]
    },
    {
      id: 2,
      user: 'Jane Smith',
      application: 'Jira Project Management',
      status: 'approved',
      requestDate: '2024-01-19',
      reason: 'Required for project tracking and bug management',
      approvers: [
        { name: 'Manager A', status: 'approved' },
        { name: 'Manager B', status: 'approved' }
      ]
    },
    {
      id: 3,
      user: 'Mike Johnson',
      application: 'AWS Console',
      status: 'rejected',
      requestDate: '2024-01-18',
      reason: 'Need access for cloud infrastructure management',
      approvers: [
        { name: 'Manager A', status: 'rejected' }
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
          <h1 className="text-2xl font-bold text-gray-900">All User Requests</h1>
          <p className="text-gray-600">Monitor all access requests (View only)</p>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg border border-blue-100">
        <div className="px-6 py-4 border-b border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900">Access Requests</h2>
        </div>
        <div className="divide-y divide-blue-50">
          {mockRequests.map((request) => (
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
                    <p className="text-sm text-gray-500 mb-3">{request.reason}</p>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-500">
                        Requested on {new Date(request.requestDate).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Approvers:</span>
                        {request.approvers.map((approver, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                              approver.status === 'approved' ? 'bg-green-100 text-green-700' :
                              approver.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {approver.name}: {approver.status}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ITAdminRequests;
