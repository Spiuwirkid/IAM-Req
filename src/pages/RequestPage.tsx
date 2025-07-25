import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Send, Activity } from 'lucide-react';
import { requestService } from '../services/requestService';
import { useCustomToast } from '../components/ui/use-toast';

const RequestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useCustomToast();
  
  // Get application details from URL params
  const appName = searchParams.get('app') || 'Unknown Application';
  const appDescription = searchParams.get('description') || 'No description available';
  const appId = searchParams.get('appId') || '';
  const businessOwner = searchParams.get('businessOwner') || 'IT Department';
  const accessLevel = searchParams.get('accessLevel') || 'Standard User';

  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appLogo, setAppLogo] = useState<string>('');

  // Fetch application logo from database
  useEffect(() => {
    const fetchAppLogo = async () => {
      if (appId) {
        try {
          const app = await requestService.getApplicationById(appId);
          if (app && app.logo) {
            setAppLogo(app.logo);
          } else {
            // Fallback to default logo
            setAppLogo('https://ozbvvxhhehqubqxqruko.supabase.co/storage/v1/object/public/app-logos/default.png');
          }
        } catch (error) {
          console.error('Error fetching app logo:', error);
          // Fallback to default logo
          setAppLogo('https://ozbvvxhhehqubqxqruko.supabase.co/storage/v1/object/public/app-logos/default.png');
        }
      }
    };

    fetchAppLogo();
  }, [appId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      showError('Validation Error ❌', 'Please provide a business justification for your request.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if we have a valid application ID
      if (!appId) {
        throw new Error('No application ID provided');
      }

      // Create request with current authenticated user
      await requestService.createRequest({
        application_id: appId,
        business_justification: reason,
        requested_access_level: accessLevel,
        requested_duration: '6 months'
      });

      // Show beautiful success toast
      showSuccess(
        'Request Submitted Successfully! 🎉',
        `Your request for "${appName}" has been sent to Manager A for approval.`
      );
      
      // Navigate to requests page after a short delay
      setTimeout(() => {
        navigate('/staff/myrequest');
      }, 2000);
    } catch (error) {
      console.error('Error submitting request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit request. Please try again.';
      showError(
        'Request Failed ❌',
        errorMessage
      );
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
              src={appLogo || getAppLogo(appName)}
              alt={appName}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                // Fallback to default logo if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = 'https://ozbvvxhhehqubqxqruko.supabase.co/storage/v1/object/public/app-logos/default.png';
              }}
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

      {/* Sequential Approval Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Approval Process</h3>
        <p className="text-blue-800 mb-4">Your request will go through a 3-level approval process:</p>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
            <span className="text-blue-800">Manager A - First Level Approval</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <span className="text-blue-800">Manager B - Second Level Approval</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
            <span className="text-blue-800">Manager C - Final Approval</span>
          </div>
        </div>
        <p className="text-blue-700 text-sm mt-4">
          <strong>Note:</strong> All three managers must approve your request for final approval.
        </p>
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