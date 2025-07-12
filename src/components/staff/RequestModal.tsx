
import { useState } from 'react';
import { X, User, Users, Clock } from 'lucide-react';

interface RequestModalProps {
  app: any;
  user: any;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}

const RequestModal = ({ app, user, onSubmit, onClose }: RequestModalProps) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSubmit(reason);
    setIsSubmitting(false);
  };

  const IconComponent = app.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Request Access</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Application Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${app.color}`}>
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{app.name}</h3>
                <p className="text-sm text-gray-600">{app.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Business Owner:</span>
                <p className="font-medium text-gray-900">{app.businessOwner}</p>
              </div>
              <div>
                <span className="text-gray-500">Access Level:</span>
                <p className="font-medium text-gray-900">{app.accessLevel}</p>
              </div>
            </div>
          </div>

          {/* Requester Info */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Requester Information</h4>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Approval Workflow */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Approval Workflow</h4>
            <div className="space-y-2">
              {app.approvers.map((approver: string, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-center w-6 h-6 bg-yellow-200 rounded-full text-xs font-medium text-yellow-800">
                    {index + 1}
                  </div>
                  <Users className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-900">{approver}</span>
                  <Clock className="h-4 w-4 text-yellow-600 ml-auto" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * All approvers must approve before access is granted
            </p>
          </div>

          {/* Request Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Business Justification *
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please explain why you need access to this application and how it will be used for business purposes..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a clear business justification to help expedite approval
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!reason.trim() || isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
