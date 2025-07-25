
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Server,
  Cloud,
  Monitor,
  Code,
  HardDrive,
  Network,
  Files,
  Layers,
  Clock,
  CheckCircle,
  Activity,
  XCircle
} from 'lucide-react';
import { requestService, type RequestWithApprovals, type Application } from '../../services/requestService';

const AppCatalog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userRequests, setUserRequests] = useState<RequestWithApprovals[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Load applications and user requests
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load applications from database
        const [apps, requests] = await Promise.all([
          requestService.getApplications(),
          requestService.getUserRequests() // Remove hardcoded user ID, use current user
        ]);
        
        setApplications(apps);
        setUserRequests(requests);
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to empty arrays if error
        setApplications([]);
        setUserRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Check if user has already requested an application
  const getApplicationStatus = (appName: string) => {
    const existingRequest = userRequests.find(
      req => req.application_name === appName
    );
    
    if (!existingRequest) {
      return 'available';
    }
    
    if (existingRequest.status === 'approved') {
      return 'approved';
    }
    
    if (existingRequest.status === 'pending') {
      return 'waiting';
    }
    
    if (existingRequest.status === 'rejected') {
      return 'rejected';
    }
    
    return 'available';
  };

  // Get unique categories from applications
  const categories = ['all', ...Array.from(new Set(applications.map(app => app.category)))];

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRequestAccess = (app: Application) => {
    // Check if user already has pending request for this app
    const appStatus = getApplicationStatus(app.name);
    if (appStatus === 'waiting') {
      // Redirect to requests page if already requested
      navigate('/staff/requests');
      return;
    }

    if (appStatus === 'approved') {
      // TODO: Implement login functionality for approved applications
      console.log('User has approved access to:', app.name);
      // For now, just show a message or redirect to the application
      alert(`You have approved access to ${app.name}. Please contact IT for login credentials.`);
      return;
    }

    // Navigate to request page with app data as URL params
    const params = new URLSearchParams({
      app: app.name,
      description: app.description,
      appId: app.id
    });
    navigate(`/staff/request?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-blue-100 p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/staff')}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-blue-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Catalog</h1>
            <p className="text-gray-600">Request access to business applications</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-blue-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              className="w-full pl-12 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
      </div>

      {/* Applications Grid */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-blue-100 p-12 text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No applications available</h3>
          <p className="text-gray-600">Please contact your IT administrator to add applications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => {
            return (
              <div key={app.id} className="bg-white rounded-xl border border-blue-100 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
                        <img 
                          src={app.logo || 'https://ozbvvxhhehqubqxqruko.supabase.co/storage/v1/object/public/app-logos/default.png'} 
                          alt={app.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Fallback to default logo if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://ozbvvxhhehqubqxqruko.supabase.co/storage/v1/object/public/app-logos/default.png';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{app.name}</h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {app.category}
                        </span>
                      </div>
                    </div>
                    {app.type_level === 'Leveling' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Leveling
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3 flex-grow">
                    <p className="text-sm text-gray-600">{app.description}</p>
                  
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Type: {app.type_level}</span>
                      {app.type_level === 'Leveling' && (
                        <span className="text-gray-600">{app.managers.length} manager{app.managers.length > 1 ? 's' : ''}</span>
                      )}
                    </div>
                    
                    {app.type_level === 'Leveling' && app.managers.length > 0 && (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Managers:</span>
                          <span className="font-medium text-gray-800">{app.managers.join(', ')}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Spacer for consistent height */}
                    {app.type_level === 'No leveling' && (
                      <div className="h-8"></div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 mt-auto">
                    {(() => {
                      const status = getApplicationStatus(app.name);
                      switch (status) {
                        case 'approved':
                          return (
                            <button
                              onClick={() => handleRequestAccess(app)}
                              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Login
                            </button>
                          );
                        case 'waiting':
                          return (
                            <button
                              onClick={() => handleRequestAccess(app)}
                              className="w-full flex items-center justify-center px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Waiting
                            </button>
                          );
                        case 'rejected':
                          return (
                            <button
                              onClick={() => handleRequestAccess(app)}
                              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejected
                            </button>
                          );
                        default:
                          return (
                            <button
                              onClick={() => handleRequestAccess(app)}
                              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Request Access
                            </button>
                          );
                      }
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {applications.length > 0 && filteredApps.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No applications found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AppCatalog;
