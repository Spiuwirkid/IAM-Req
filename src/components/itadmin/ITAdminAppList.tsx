
import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Activity } from 'lucide-react';

interface ITAdminAppListProps {
  onBack: () => void;
  user: any;
}

const ITAdminAppList = ({ onBack, user }: ITAdminAppListProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApp, setNewApp] = useState({
    name: '',
    description: '',
    category: '',
    businessOwner: '',
    accessLevel: 'Standard User'
  });

  // Mock data - in real app this would come from Supabase
  const [applications, setApplications] = useState([
    {
      id: 1,
      name: 'Salesforce CRM',
      description: 'Customer relationship management platform',
      category: 'Sales',
      businessOwner: 'Sales Director',
      accessLevel: 'Standard User'
    },
    {
      id: 2,
      name: 'Jira Project Management',
      description: 'Issue and project tracking software',
      category: 'Development',
      businessOwner: 'Engineering Director',
      accessLevel: 'Standard User'
    },
    {
      id: 3,
      name: 'AWS Console',
      description: 'Amazon Web Services cloud platform',
      category: 'Infrastructure',
      businessOwner: 'IT Director',
      accessLevel: 'Read Only'
    }
  ]);

  const categories = ['Sales', 'Development', 'Infrastructure', 'Analytics', 'Communication', 'Documentation', 'Security'];

  const handleAddApp = () => {
    if (newApp.name && newApp.description && newApp.category && newApp.businessOwner) {
      const app = {
        id: applications.length + 1,
        ...newApp
      };
      setApplications([...applications, app]);
      setNewApp({ name: '', description: '', category: '', businessOwner: '', accessLevel: 'Standard User' });
      setShowAddForm(false);
    }
  };

  const handleDeleteApp = (id: number) => {
    setApplications(applications.filter(app => app.id !== id));
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
            <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
            <p className="text-gray-600">Manage all applications in the system</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </button>
      </div>

      {/* Add Application Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-blue-100 p-6">
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

      {/* Applications List */}
      <div className="bg-white rounded-lg border border-blue-100">
        <div className="px-6 py-4 border-b border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900">Applications ({applications.length})</h2>
        </div>
        <div className="divide-y divide-blue-50">
          {applications.map((app) => (
            <div key={app.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{app.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {app.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{app.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Business Owner:</span> {app.businessOwner}
                      </div>
                      <div>
                        <span className="font-medium">Access Level:</span> {app.accessLevel}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteApp(app.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ITAdminAppList;
