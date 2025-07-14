
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowLeft, Plus, Activity, Edit, ChevronDown, ChevronRight, Users } from 'lucide-react';

interface ManagerAppListProps {
  onBack: () => void;
}

const ManagerAppList = ({ onBack }: ManagerAppListProps) => {
  const { user } = useOutletContext<{ user: any }>();
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedApps, setExpandedApps] = useState<Record<number, boolean>>({});
  const [newApp, setNewApp] = useState({
    name: '',
    description: '',
    category: '',
    businessOwner: '',
    accessLevel: 'Standard User',
    logo: '/app-logo/gns3.png' // default logo
  });

  const [applications, setApplications] = useState([
    {
      id: 1,
      name: 'GNS3',
      description: 'Network simulation and virtualization platform for network engineers',
      category: 'Networking',
      businessOwner: 'Network Operations Director',
      accessLevel: 'Standard User',
      activeUsers: 45,
      logo: '/app-logo/gns3.png'
    },
    {
      id: 2,
      name: 'Proxmox VE',
      description: 'Virtualization management platform for containers and virtual machines',
      category: 'Virtualization',
      businessOwner: 'Infrastructure Director',
      accessLevel: 'Admin User',
      activeUsers: 89,
      logo: '/app-logo/proxmox.png'
    },
    {
      id: 3,
      name: 'Ubuntu Server',
      description: 'Linux server operating system for cloud and enterprise environments',
      category: 'Operating System',
      businessOwner: 'Systems Administrator',
      accessLevel: 'SSH Access',
      activeUsers: 234,
      logo: '/app-logo/ubuntu.png'
    },
    {
      id: 4,
      name: 'Windows Server',
      description: 'Microsoft server operating system for enterprise applications',
      category: 'Operating System',
      businessOwner: 'Systems Administrator',
      accessLevel: 'RDP Access',
      activeUsers: 198,
      logo: '/app-logo/windows-server.png'
    },
    {
      id: 5,
      name: 'Visual Studio',
      description: 'Integrated development environment for software development',
      category: 'Development',
      businessOwner: 'Development Team Lead',
      accessLevel: 'Professional License',
      activeUsers: 167,
      logo: '/app-logo/Visual-Studio-Logo-2019.png'
    },
    {
      id: 6,
      name: 'VMware ESXi',
      description: 'Enterprise-class hypervisor for virtualizing servers and workloads',
      category: 'Virtualization',
      businessOwner: 'Virtualization Manager',
      accessLevel: 'Administrator',
      activeUsers: 76,
      logo: '/app-logo/vmware-esxi.png'
    },
    {
      id: 7,
      name: 'AWS Console',
      description: 'Amazon Web Services cloud platform management console',
      category: 'Cloud Platform',
      businessOwner: 'Cloud Operations Director',
      accessLevel: 'Power User',
      activeUsers: 123,
      logo: '/app-logo/AWS.png'
    },
    {
      id: 8,
      name: 'NextCloud',
      description: 'Self-hosted file sharing and collaboration platform',
      category: 'File Sharing',
      businessOwner: 'IT Security Officer',
      accessLevel: 'Standard User',
      activeUsers: 289,
      logo: '/app-logo/nextcloud.png'
    }
  ]);

  const categories = ['Sales', 'Development', 'Infrastructure', 'Analytics', 'Communication', 'Documentation', 'Security'];

  const handleAddApp = () => {
    if (newApp.name && newApp.description && newApp.category && newApp.businessOwner) {
      const app = {
        id: applications.length + 1,
        ...newApp,
        activeUsers: Math.floor(Math.random() * 50) + 5
      };
      setApplications([...applications, app]);
      setNewApp({ name: '', description: '', category: '', businessOwner: '', accessLevel: 'Standard User', logo: '/app-logo/gns3.png' });
      setShowAddForm(false);
    }
  };

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
            <div style={{ color: '#002A58' }}>
              <div className="text-4xl font-bold leading-tight">
                <div>APPLICATION</div>
              </div>
              <div className="text-lg mt-4 tracking-wider font-medium">
                MANAGE APPLICATIONS AND ACCESS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Application Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mx-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Application</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newApp.name}
                onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newApp.category}
                onChange={(e) => setNewApp({ ...newApp, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                value={newApp.description}
                onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Owner</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newApp.businessOwner}
                onChange={(e) => setNewApp({ ...newApp, businessOwner: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newApp.accessLevel}
                onChange={(e) => setNewApp({ ...newApp, accessLevel: e.target.value })}
              >
                <option value="Standard User">Standard User</option>
                <option value="Read Only">Read Only</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4">
            <button
              onClick={handleAddApp}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Application
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Simplified Applications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mx-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Applications ({applications.length})</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add App
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {applications.map((app) => {
              const isExpanded = expandedApps[app.id];
              
              return (
                <div key={app.id}>
                  <div 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer"
                    onClick={() => setExpandedApps(prev => ({ ...prev, [app.id]: !isExpanded }))}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
                        <img 
                          src={app.logo} 
                          alt={app.name}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <Activity className="h-4 w-4 text-blue-600 hidden" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{app.name}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{app.category}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Users className="h-3 w-3" />
                          <span>{app.activeUsers} active users</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Edit className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="ml-6 mt-2 p-4 bg-white rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Description:</span>
                          <div className="text-gray-900 mt-1">{app.description}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Business Owner:</span>
                          <div className="text-gray-900 mt-1">{app.businessOwner}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Access Level:</span>
                          <div className="text-gray-900 mt-1">{app.accessLevel}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Active Users:</span>
                          <div className="text-gray-900 mt-1 font-semibold">{app.activeUsers}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 mt-4">
                        <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                          View Users
                        </button>
                        <button className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors">
                          Edit App
                        </button>
                      </div>
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

export default ManagerAppList;
