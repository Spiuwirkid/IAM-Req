
import { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Zap,
  Database,
  Cloud,
  Users,
  Code,
  BarChart3,
  MessageSquare,
  FileText,
  Shield
} from 'lucide-react';
import RequestModal from './RequestModal';

interface AppCatalogProps {
  onBack: () => void;
  user: any;
}

const AppCatalog = ({ onBack, user }: AppCatalogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Mock applications data
  const applications = [
    {
      id: 1,
      name: 'Salesforce CRM',
      description: 'Customer relationship management platform',
      category: 'Sales',
      icon: Users,
      color: 'bg-blue-500',
      approvers: ['Manager A', 'Manager B'],
      businessOwner: 'Sales Director',
      accessLevel: 'Standard User'
    },
    {
      id: 2,
      name: 'Jira Project Management',
      description: 'Issue and project tracking software',
      category: 'Development',
      icon: Code,
      color: 'bg-blue-600',
      approvers: ['Manager A'],
      businessOwner: 'Engineering Director',
      accessLevel: 'Standard User'
    },
    {
      id: 3,
      name: 'AWS Console',
      description: 'Amazon Web Services cloud platform',
      category: 'Infrastructure',
      icon: Cloud,
      color: 'bg-orange-500',
      approvers: ['Manager A', 'IT Security Manager'],
      businessOwner: 'IT Director',
      accessLevel: 'Read Only'
    },
    {
      id: 4,
      name: 'Tableau Analytics',
      description: 'Business intelligence and data visualization',
      category: 'Analytics',
      icon: BarChart3,
      color: 'bg-purple-500',
      approvers: ['Manager A'],
      businessOwner: 'Data Director',
      accessLevel: 'Standard User'
    },
    {
      id: 5,
      name: 'Slack Workspace',
      description: 'Team communication and collaboration',
      category: 'Communication',
      icon: MessageSquare,
      color: 'bg-green-500',
      approvers: ['Manager A'],
      businessOwner: 'HR Director',
      accessLevel: 'Standard User'
    },
    {
      id: 6,
      name: 'Confluence Wiki',
      description: 'Team collaboration and documentation',
      category: 'Documentation',
      icon: FileText,
      color: 'bg-indigo-500',
      approvers: ['Manager A'],
      businessOwner: 'Knowledge Manager',
      accessLevel: 'Standard User'
    },
    {
      id: 7,
      name: 'VPN Access',
      description: 'Secure remote network access',
      category: 'Security',
      icon: Shield,
      color: 'bg-red-500',
      approvers: ['IT Security Manager', 'Manager A'],
      businessOwner: 'IT Security Director',
      accessLevel: 'Standard Access'
    },
    {
      id: 8,
      name: 'Power BI',
      description: 'Business analytics and reporting tool',
      category: 'Analytics',
      icon: Zap,
      color: 'bg-yellow-500',
      approvers: ['Manager A'],
      businessOwner: 'Business Intelligence Lead',
      accessLevel: 'Standard User'
    }
  ];

  const categories = ['all', ...Array.from(new Set(applications.map(app => app.category)))];

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRequestAccess = (app: any) => {
    setSelectedApp(app);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = (app: any, reason: string) => {
    // In real app, this would create a request in Supabase
    console.log('Submitting request:', { app: app.name, reason, user: user.email });
    setShowRequestModal(false);
    setSelectedApp(null);
    // You could show a success toast here
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
            <h1 className="text-2xl font-bold text-gray-900">Application Catalog</h1>
            <p className="text-gray-600">Request access to business applications</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search applications..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => {
          const IconComponent = app.icon;
          return (
            <div key={app.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${app.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {app.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{app.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{app.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Business Owner:</span>
                    <span className="text-gray-900">{app.businessOwner}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Access Level:</span>
                    <span className="text-gray-900">{app.accessLevel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Approvers:</span>
                    <span className="text-gray-900">{app.approvers.length}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRequestAccess(app)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Request Access
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && selectedApp && (
        <RequestModal
          app={selectedApp}
          user={user}
          onSubmit={(reason) => handleSubmitRequest(selectedApp, reason)}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedApp(null);
          }}
        />
      )}
    </div>
  );
};

export default AppCatalog;
