import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { requestService } from '../services/requestService';

const RequestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get app data from URL params
  const appName = searchParams.get('app') || 'GNS3';
  const appDescription = searchParams.get('description') || 'Network simulation and virtualization platform for network engineers';
  const appId = searchParams.get('appId') || '';
  const businessOwner = searchParams.get('owner') || 'Network Operations Director';
  const accessLevel = searchParams.get('access') || 'Standard User';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Mock user data - in real app this would come from auth
      const userData = {
        user_id: 'staff_user_1',
        user_name: 'Alex Johnson',
        user_email: 'alex.johnson@company.com'
      };

      // Check if we have a valid application ID
      if (!appId) {
        throw new Error('No application ID provided');
      }

      await requestService.createRequest({
        ...userData,
        application_id: appId,
        application_name: appName,
        business_justification: reason,
        requested_access_level: accessLevel,
        requested_duration: '6 months'
      });

      // Show success and redirect
      alert('Request submitted successfully!');
      navigate('/staff/myrequest');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to get the appropriate logo
  const getAppLogo = (appName: string) => {
    const logoMap: { [key: string]: string } = {
      'GN53': '/app-logo/gns3.png',
      'GNS3': '/app-logo/gns3.png',
      'VMware ESXi': '/app-logo/vmware-esxi.png',
      'VMware vSphere': '/app-logo/vmware-esxi.png',
      'Proxmox': '/app-logo/proxmox.png',
      'Ubuntu Server': '/app-logo/ubuntu.png',
      'Ubuntu': '/app-logo/ubuntu.png',
      'Windows Server': '/app-logo/windows-server.png',
      'Visual Studio': '/app-logo/Visual-Studio-Logo-2019.png',
      'AWS': '/app-logo/AWS.png',
      'NextCloud': '/app-logo/nextcloud.png',
      'Nextcloud': '/app-logo/nextcloud.png'
    };
    return logoMap[appName] || '/app-logo/gns3.png';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request Access</h1>
            <p className="text-gray-600">Submit your application access request</p>
          </div>
        </div>
      </div>

      {/* Application Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <img
              src={getAppLogo(appName)}
              alt={appName}
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{appName}</h3>
            <p className="text-gray-600 mt-1">{appDescription}</p>
            <div className="flex items-center space-x-6 mt-3">
              <span className="text-sm text-gray-500">
                <strong>Owner:</strong> {businessOwner}
              </span>
              <span className="text-sm text-gray-500">
                <strong>Access:</strong> {accessLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Request Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Why do you need access to this application? *
            </label>
            <textarea
              rows={8}
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-base"
              placeholder="Please explain your business need for this application:

• What specific tasks will you perform?
• How will this help your daily work?
• Any urgent deadlines or requirements?

Be clear and specific to help speed up approval."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/staff/catalog')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestPage; 