
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Users, Calendar, MessageSquare, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { requestService, type RequestWithApprovals } from '../../services/requestService';

interface ITAdminRequestsProps {
  onBack: () => void;
  user: any;
}

const ITAdminRequests = ({ onBack, user }: ITAdminRequestsProps) => {
  const [requests, setRequests] = useState<RequestWithApprovals[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real requests from database
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        console.log('🔍 Debug: Loading all requests for IT Admin...');
        const allRequests = await requestService.getAllRequests();
        console.log('🔍 Debug: Loaded requests:', allRequests);
        setRequests(allRequests);
      } catch (error) {
        console.error('Error loading requests:', error);
        setRequests([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with Floating Background */}
      <div className="px-8 py-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
              <h1 className="text-2xl font-bold text-gray-900">System Access Monitor</h1>
              <p className="text-gray-600">Monitor all access requests across the organization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mx-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 mb-2 font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-700">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-2 font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-700">{approvedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-2 font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-700">{rejectedCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mx-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">All Access Requests</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Total: {requests.length} requests</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
          {requests.map((request) => (
              <div 
                key={request.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                    {getUserInitials(request.user_name)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{request.user_name}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-600">{request.application_name}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Level: {request.current_level}/{request.total_levels}</span>
                      <span className="text-gray-400">•</span>
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{request.business_justification?.substring(0, 80)}...</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                    {request.status === 'pending' ? 'Pending' : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {requests.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No requests to monitor</h3>
              <p className="text-gray-600">Access requests will appear here when submitted by users</p>
            </div>
          )}
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 mx-8 mt-8 p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Monitoring View</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              As IT Admin, you have a comprehensive view of all access requests across the organization. 
              This monitoring dashboard allows you to track the status of requests, identify bottlenecks, 
              and ensure proper approval workflows are being followed. You can see which managers are 
              responsible for each request and monitor approval progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ITAdminRequests;
