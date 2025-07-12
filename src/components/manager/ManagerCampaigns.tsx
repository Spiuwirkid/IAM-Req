
import { ArrowLeft, Calendar, Users, Activity, Clock, CheckCircle } from 'lucide-react';

interface ManagerCampaignsProps {
  onBack: () => void;
  user: any;
}

const ManagerCampaigns = ({ onBack, user }: ManagerCampaignsProps) => {
  // Mock data
  const campaigns = [
    {
      id: 1,
      name: 'Q1 2024 Salesforce Access Review',
      description: 'Quarterly review of Salesforce CRM access permissions',
      application: 'Salesforce CRM',
      status: 'active',
      createdDate: '2024-01-01',
      dueDate: '2024-03-31',
      createdBy: 'IT Admin',
      usersToReview: 25,
      usersReviewed: 15,
      assignedToMe: true
    },
    {
      id: 2,
      name: 'Jira Access Audit 2024',
      description: 'Annual audit for Jira Project Management access',
      application: 'Jira Project Management',
      status: 'active',
      createdDate: '2024-01-15',
      dueDate: '2024-04-15',
      createdBy: 'IT Admin',
      usersToReview: 18,
      usersReviewed: 8,
      assignedToMe: true
    },
    {
      id: 3,
      name: 'AWS Console Security Review',
      description: 'Security audit for AWS Console access',
      application: 'AWS Console',
      status: 'completed',
      createdDate: '2023-12-01',
      dueDate: '2023-12-31',
      createdBy: 'IT Admin',
      usersToReview: 8,
      usersReviewed: 8,
      assignedToMe: false
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const myCampaigns = campaigns.filter(campaign => campaign.assignedToMe);

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
          <h1 className="text-2xl font-bold text-gray-900">Audit Campaigns</h1>
          <p className="text-gray-600">Review access campaigns assigned to you</p>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-blue-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">
                {myCampaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-blue-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Users to Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {myCampaigns.reduce((sum, c) => sum + (c.usersToReview - c.usersReviewed), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-blue-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {myCampaigns.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg border border-blue-100">
        <div className="px-6 py-4 border-b border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900">My Assigned Campaigns</h2>
        </div>
        <div className="divide-y divide-blue-50">
          {myCampaigns.map((campaign) => (
            <div key={campaign.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(campaign.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{campaign.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        campaign.status === 'active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-gray-500 mb-3">
                      <div>
                        <span className="font-medium">Application:</span> {campaign.application}
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span> {new Date(campaign.dueDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Progress:</span> {campaign.usersReviewed}/{campaign.usersToReview} users
                      </div>
                      <div>
                        <span className="font-medium">Created by:</span> {campaign.createdBy}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(campaign.usersReviewed / campaign.usersToReview) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round((campaign.usersReviewed / campaign.usersToReview) * 100)}% Complete
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {campaign.status === 'active' && (
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded hover:bg-blue-200 transition-colors">
                      Review Users
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerCampaigns;
