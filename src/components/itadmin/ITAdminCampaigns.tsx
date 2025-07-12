
import { useState } from 'react';
import { ArrowLeft, Plus, Calendar, Users, Activity } from 'lucide-react';

interface ITAdminCampaignsProps {
  onBack: () => void;
  user: any;
}

const ITAdminCampaigns = ({ onBack, user }: ITAdminCampaignsProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    application: '',
    dueDate: '',
    assignedManagers: []
  });

  // Mock data
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Q1 2024 Salesforce Access Review',
      description: 'Quarterly review of Salesforce CRM access permissions',
      application: 'Salesforce CRM',
      status: 'active',
      createdDate: '2024-01-01',
      dueDate: '2024-03-31',
      assignedManagers: ['Manager A', 'Manager B'],
      usersToReview: 25
    },
    {
      id: 2,
      name: 'AWS Console Access Audit',
      description: 'Security audit for AWS Console access',
      application: 'AWS Console',
      status: 'completed',
      createdDate: '2023-12-01',
      dueDate: '2023-12-31',
      assignedManagers: ['Manager A'],
      usersToReview: 8
    }
  ]);

  const applications = ['Salesforce CRM', 'Jira Project Management', 'AWS Console', 'Tableau Analytics'];
  const managers = ['Manager A', 'Manager B', 'Manager C'];

  const handleCreateCampaign = () => {
    if (newCampaign.name && newCampaign.application && newCampaign.dueDate) {
      const campaign = {
        id: campaigns.length + 1,
        ...newCampaign,
        status: 'active',
        createdDate: new Date().toISOString().split('T')[0],
        usersToReview: Math.floor(Math.random() * 50) + 5
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
    <div className="space-y-6">
      {/* Header */}
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
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </button>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Campaign</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="e.g., Q1 2024 Salesforce Access Review"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newCampaign.dueDate}
                  onChange={(e) => setNewCampaign({ ...newCampaign, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Managers</label>
              <div className="space-y-2">
                {managers.map(manager => (
                  <label key={manager} className="flex items-center">
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

      {/* Campaigns List */}
      <div className="bg-white rounded-lg border border-blue-100">
        <div className="px-6 py-4 border-b border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900">Audit Campaigns</h2>
        </div>
        <div className="divide-y divide-blue-50">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{campaign.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Application:</span> {campaign.application}
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span> {new Date(campaign.dueDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Users to Review:</span> {campaign.usersToReview}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-gray-500 font-medium">Assigned Managers: </span>
                      {campaign.assignedManagers.map((manager, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 mr-1"
                        >
                          {manager}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ITAdminCampaigns;
