
import { useState } from 'react';
import { ArrowLeft, Plus, Calendar, Users, Activity, Clock, CheckCircle, ArrowRight, MessageSquare } from 'lucide-react';

interface ITAdminCampaignsProps {
  onBack: () => void;
  user: any;
}

const ITAdminCampaigns = ({ onBack, user }: ITAdminCampaignsProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    application: '',
    dueDate: '',
    assignedManagers: []
  });

  // Simplified mock data
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Q3 GNS3 Access Review',
      description: 'Quarterly review of GNS3 network simulation access permissions',
      application: 'GNS3',
      status: 'active',
      createdDate: '2025-07-01',
      dueDate: '2025-09-30',
      assignedManagers: ['Manager A', 'Manager B'],
      usersToReview: 25,
      progress: 60
    },
    {
      id: 2,
      name: 'Proxmox Access Audit',
      description: 'Security audit for Proxmox virtualization platform access',
      application: 'Proxmox VE',
      status: 'active',
      createdDate: '2025-06-15',
      dueDate: '2025-08-15',
      assignedManagers: ['Manager A', 'Manager C'],
      usersToReview: 18,
      progress: 45
    },
    {
      id: 3,
      name: 'AWS Console Review',
      description: 'Annual review of AWS Console cloud platform access',
      application: 'AWS Console',
      status: 'completed',
      createdDate: '2025-05-01',
      dueDate: '2025-06-30',
      assignedManagers: ['Manager B'],
      usersToReview: 12,
      progress: 100
    }
  ]);

  const applications = ['GNS3', 'Proxmox VE', 'Ubuntu Server', 'Windows Server', 'Visual Studio', 'VMware ESXi', 'AWS Console', 'NextCloud'];
  const managers = ['Manager A', 'Manager B', 'Manager C'];

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  const handleCreateCampaign = () => {
    if (newCampaign.name && newCampaign.application && newCampaign.dueDate) {
      const campaign = {
        id: campaigns.length + 1,
        ...newCampaign,
        status: 'active',
        createdDate: new Date().toISOString().split('T')[0],
        usersToReview: Math.floor(Math.random() * 50) + 5,
        progress: 0
      };
      setCampaigns([...campaigns, campaign]);
      setNewCampaign({ name: '', description: '', application: '', dueDate: '', assignedManagers: [] });
      setShowCreateForm(false);
    }
  };

  const handleManagerToggle = (manager: string) => {
    const managers = newCampaign.assignedManagers.includes(manager)
      ? newCampaign.assignedManagers.filter(m => m !== manager)
      : [...newCampaign.assignedManagers, manager];
    setNewCampaign({ ...newCampaign, assignedManagers: managers });
  };

  return (
    <div className="min-h-screen">
      {/* Header with Floating Background */}
      <div className="px-8 py-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
                <p className="text-gray-600">Create and manage quarterly access review campaigns</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mx-8 mb-8 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Campaign</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="e.g., Q3 2025 GNS3 Access Review"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                placeholder="Describe the purpose of this audit campaign"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application to Audit</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newCampaign.application}
                  onChange={(e) => setNewCampaign({ ...newCampaign, application: e.target.value })}
                >
                  <option value="">Select Application</option>
                  {applications.map(app => (
                    <option key={app} value={app}>{app}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newCampaign.dueDate}
                  onChange={(e) => setNewCampaign({ ...newCampaign, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Managers</label>
              <div className="grid grid-cols-3 gap-2">
                {managers.map(manager => (
                  <label key={manager} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={newCampaign.assignedManagers.includes(manager)}
                      onChange={() => handleManagerToggle(manager)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{manager}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-6">
            <button
              onClick={handleCreateCampaign}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Campaign
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-6 mb-8 mx-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 mb-2 font-medium">Active Campaigns</p>
              <p className="text-3xl font-bold text-yellow-700">{activeCampaigns.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-2 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-700">{completedCampaigns.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mx-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Campaigns</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div 
                key={campaign.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                    {campaign.status === 'active' ? (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{campaign.name}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 text-sm">{campaign.application}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Due: {new Date(campaign.dueDate).toLocaleDateString()}</span>
                      <span className="text-gray-400">•</span>
                      <span>{campaign.usersToReview} users to review</span>
                      {campaign.status === 'active' && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{campaign.progress}% complete</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">Assigned to:</span>
                      {campaign.assignedManagers.map((manager, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {manager}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {campaigns.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No campaigns yet</h3>
              <p className="text-gray-600 mb-6">Create your first audit campaign to get started</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-purple-50 rounded-xl border border-purple-200 mx-8 mt-8 p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Campaign Management</h3>
            <p className="text-sm text-purple-800 leading-relaxed">
              As IT Admin, you can create and manage quarterly access review campaigns. These campaigns help ensure 
              proper access governance by regularly reviewing user permissions across different applications. 
              You can assign campaigns to managers who will review their team members' access rights and determine 
              if continued access is necessary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ITAdminCampaigns;
