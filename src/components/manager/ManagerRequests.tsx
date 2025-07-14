
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, Users, Calendar, MessageSquare, FileText, ChevronRight, ChevronDown } from 'lucide-react';

interface ManagerRequestsProps {
  onBack: () => void;
}

const ManagerRequests = ({ onBack }: ManagerRequestsProps) => {
  const { user } = useOutletContext<{ user: any }>();
  
  // Simplified staff requests - focus on pending requests that need manager action
  const [staffRequests, setStaffRequests] = useState([
    {
      id: 1,
      staffName: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      department: 'IT Operations',
      requestedApps: [
        {
          id: 101,
          appName: 'GNS3',
          reason: 'Need access for network simulation and lab environment setup for upcoming infrastructure project',
          requestDate: '2025-07-10',
          status: 'pending'
        },
        {
          id: 102,
          appName: 'NextCloud',
          reason: 'Need secure file sharing access for team collaboration and document management',
          requestDate: '2025-07-05',
          status: 'pending'
        }
      ]
    },
    {
      id: 2,
      staffName: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b050?w=150&h=150&fit=crop&crop=face',
      department: 'Development',
      requestedApps: [
        {
          id: 201,
          appName: 'Visual Studio',
          reason: 'Required for software development and coding projects. Need professional license for advanced debugging features',
          requestDate: '2025-07-08',
          status: 'pending'
        }
      ]
    },
    {
      id: 3,
      staffName: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      department: 'Infrastructure',
      requestedApps: [
        {
          id: 301,
          appName: 'Ubuntu Server',
          reason: 'Need SSH access for server administration and maintenance tasks',
          requestDate: '2025-06-18',
          status: 'pending'
        }
      ]
    },
    {
      id: 4,
      staffName: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      department: 'Virtualization',
      requestedApps: [
        {
          id: 401,
          appName: 'VMware ESXi',
          reason: 'Need access for virtualization management and hypervisor administration',
          requestDate: '2025-07-11',
          status: 'pending'
        }
      ]
    }
  ]);

  const [expandedStaff, setExpandedStaff] = useState<Record<number, boolean>>({});
  const [selectedAppRequest, setSelectedAppRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = (staffId: number, appId: number) => {
    setStaffRequests(prev => prev.map(staff => {
      if (staff.id === staffId) {
        return {
          ...staff,
          requestedApps: staff.requestedApps.map(app => 
            app.id === appId ? { ...app, status: 'approved' } : app
          )
        };
      }
      return staff;
    }));
    setSelectedAppRequest(null);
  };

  const handleReject = (staffId: number, appId: number) => {
    setStaffRequests(prev => prev.map(staff => {
      if (staff.id === staffId) {
        return {
          ...staff,
          requestedApps: staff.requestedApps.map(app => 
            app.id === appId ? { ...app, status: 'rejected', rejectReason } : app
          )
        };
      }
      return staff;
    }));
    setShowRejectModal(false);
    setSelectedAppRequest(null);
    setRejectReason('');
  };

  const pendingCount = staffRequests.reduce((sum, staff) => 
    sum + staff.requestedApps.filter(app => app.status === 'pending').length, 0
  );

  const approvedCount = staffRequests.reduce((sum, staff) => 
    sum + staff.requestedApps.filter(app => app.status === 'approved').length, 0
  );

  const rejectedCount = staffRequests.reduce((sum, staff) => 
    sum + staff.requestedApps.filter(app => app.status === 'rejected').length, 0
  );

  // Detail view when app is selected
  if (selectedAppRequest) {
    const staff = staffRequests.find(s => s.id === selectedAppRequest.staffId);
    const app = staff?.requestedApps.find(a => a.id === selectedAppRequest.appId);
    
    return (
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mx-8 mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedAppRequest(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <img 
              src={staff?.avatar} 
              alt={staff?.staffName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{app?.appName} Access Request</h1>
              <p className="text-gray-600">Request by {staff?.staffName} • {staff?.department}</p>
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mx-8">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Staff Name:</span>
                      <div className="flex items-center space-x-2">
                        <img 
                          src={staff?.avatar} 
                          alt={staff?.staffName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm font-semibold text-gray-900">{staff?.staffName}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Department:</span>
                      <span className="text-sm font-semibold text-gray-900">{staff?.department}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Application:</span>
                      <span className="text-sm font-semibold text-gray-900">{app?.appName}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Request Date:</span>
                      <span className="text-sm font-semibold text-gray-900">{app && new Date(app.requestDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Reason for Access</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{app?.reason}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Manager Action Required</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Pending Your Approval</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">
                      This request requires your approval to grant access to {app?.appName}.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(selectedAppRequest.staffId, selectedAppRequest.appId)}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 inline mr-2" />
                      Approve Request
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4 inline mr-2" />
                      Reject Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Request</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this access request.
              </p>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedAppRequest.staffId, selectedAppRequest.appId)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mx-8 mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Access Requests</h1>
            <p className="text-gray-600">Review and approve access requests from your team</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mx-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 mb-2 font-medium">Pending Approval</p>
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

      {/* Staff Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mx-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Staff Requests</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {staffRequests.map((staff) => {
              const isExpanded = expandedStaff[staff.id];
              const pendingApps = staff.requestedApps.filter(app => app.status === 'pending');
              
              return (
                <div key={staff.id}>
                  <div 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer"
                    onClick={() => setExpandedStaff(prev => ({ ...prev, [staff.id]: !isExpanded }))}
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={staff.avatar} 
                        alt={staff.staffName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{staff.staffName}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{staff.department}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{staff.requestedApps.length} request(s)</span>
                          {pendingApps.length > 0 && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-yellow-600 font-medium">{pendingApps.length} pending</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {pendingApps.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Action Required
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="ml-6 mt-2 space-y-2">
                      {staff.requestedApps.map((app) => (
                        <div 
                          key={app.id} 
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedAppRequest({ staffId: staff.id, appId: app.id })}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              app.status === 'approved' ? 'bg-green-500' :
                              app.status === 'rejected' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}>
                              {app.appName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900">{app.appName}</span>
                                {app.status === 'pending' && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Needs Approval
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {new Date(app.requestDate).toLocaleDateString()} • {app.reason.substring(0, 50)}...
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              app.status === 'approved' ? 'bg-green-100 text-green-800' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerRequests;
