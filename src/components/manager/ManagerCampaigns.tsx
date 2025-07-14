
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Activity, Clock, CheckCircle, ArrowRight } from 'lucide-react';

interface ManagerCampaignsProps {
  onBack: () => void;
}

const ManagerCampaigns = ({ onBack }: ManagerCampaignsProps) => {
  const { user } = useOutletContext<{ user: any }>();
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  // Simplified mock data
  const campaigns = [
    {
      id: 1,
      name: 'Q3 GNS3 Access Review',
      application: 'GNS3',
      status: 'active',
      dueDate: '2025-09-30',
      progress: 60,
      usersLeft: 10,
      users: [
        { id: 1, name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', status: 'pending', lastAccess: '2025-07-15', department: 'IT' },
        { id: 2, name: 'Jane Smith', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b050?w=150&h=150&fit=crop&crop=face', status: 'accepted', lastAccess: '2025-07-14', department: 'Engineering' },
        { id: 3, name: 'Mike Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', status: 'pending', lastAccess: '2025-07-10', department: 'Networks' }
      ]
    },
    {
      id: 2,
      name: 'Proxmox Access Audit',
      application: 'Proxmox VE',
      status: 'active',
      dueDate: '2025-08-15',
      progress: 45,
      usersLeft: 10,
      users: [
        { id: 4, name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', status: 'pending', lastAccess: '2025-07-12', department: 'Infrastructure' },
        { id: 5, name: 'Alex Brown', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', status: 'accepted', lastAccess: '2025-07-13', department: 'DevOps' }
      ]
    },
    {
      id: 3,
      name: 'AWS Console Review',
      application: 'AWS Console',
      status: 'completed',
      dueDate: '2025-06-30',
      progress: 100,
      usersLeft: 0,
      users: [
        { id: 6, name: 'Emily Davis', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', status: 'accepted', lastAccess: '2025-06-25', department: 'Cloud' }
      ]
    }
  ];

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  const handleUserAction = (userId: number, action: 'accept' | 'pending' | 'revoke') => {
    if (selectedCampaign) {
      const updatedUsers = selectedCampaign.users.map((u: any) => 
        u.id === userId ? { ...u, status: action } : u
      );
      setSelectedCampaign({ ...selectedCampaign, users: updatedUsers });
    }
  };

  if (selectedCampaign) {
    return (
      <div className="min-h-screen">
        {/* Floating Header Box */}
        <div className="mx-8 mt-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div style={{ color: '#002A58' }}>
                <div className="text-2xl font-bold leading-tight">
                  {selectedCampaign.name}
                </div>
                <div className="text-sm mt-1 tracking-wider font-medium opacity-80">
                  USER ACCESS REVIEW FOR {selectedCampaign.application.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mx-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Users with {selectedCampaign.application} Access</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {selectedCampaign.users.map((u: any) => (
                <div 
                  key={u.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center space-x-4">
                    <img 
                      src={u.avatar} 
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{u.name}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{u.department}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Last access: {new Date(u.lastAccess).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      u.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      u.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                    <button
                      onClick={() => handleUserAction(u.id, 'accept')}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUserAction(u.id, 'pending')}
                      className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleUserAction(u.id, 'revoke')}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Floating Header Box */}
      <div className="mx-8 mt-8 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
            <div style={{ color: '#002A58' }}>
              <div className="text-4xl font-bold leading-tight">
                <div>CAMPAIGNS</div>
        </div>
              <div className="text-lg mt-4 tracking-wider font-medium">
                REVIEW ACCESS CAMPAIGNS
            </div>
            </div>
          </div>
        </div>
            </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-2 gap-6 mb-8 mx-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 mb-2 font-medium">Active</p>
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

      {/* Simplified Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mx-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Your Campaigns</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div 
                key={campaign.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer"
                onClick={() => setSelectedCampaign(campaign)}
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
                      {campaign.status === 'active' && (
                        <span>{campaign.usersLeft} users left</span>
                      )}
                    </div>
                  </div>
                    </div>
                    
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mb-1">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          campaign.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${campaign.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{campaign.progress}%</span>
                  </div>
                  {campaign.status === 'active' && (
                    <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                      Review
                    </button>
                  )}
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerCampaigns;
