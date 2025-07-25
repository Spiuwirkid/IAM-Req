
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Activity, Upload, Check } from 'lucide-react';
import { requestService, type Application } from '../../services/requestService';
import { supabase } from '../../lib/supabase'; // Fixed import path

// Constants
const DEFAULT_LOGO_URL = 'https://ozbvvxhhehqubqxqruko.supabase.co/storage/v1/object/public/app-logos/default.png';

interface ITAdminAppListProps {
  onBack: () => void;
  user: any;
}

const ITAdminAppList = ({ onBack, user }: ITAdminAppListProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [newApp, setNewApp] = useState({
    name: '',
    description: '',
    category: '',
    type_level: 'No leveling' as 'Leveling' | 'No leveling',
    managers: [] as string[],
    logo: DEFAULT_LOGO_URL
  });

  // Add validation state
  const [nameError, setNameError] = useState<string | null>(null);

  const categories = [
    'Sales', 'Development', 'Infrastructure', 'Analytics', 
    'Communication', 'Documentation', 'Security', 'Networking', 
    'Virtualization', 'Operating System', 'Cloud Platform', 'File Sharing'
  ];

  const availableManagers = ['Manager A', 'Manager B', 'Manager C'];

  // Load applications from database
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const apps = await requestService.getApplications();
        setApplications(apps);
      } catch (error) {
        console.error('Error loading applications:', error);
        // Fallback to empty array if error
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const handleAddApp = async () => {
    if (newApp.name && newApp.description && newApp.category) {
      // Check for duplicate application name
      const existingApp = applications.find(app => 
        app.name.toLowerCase().trim() === newApp.name.toLowerCase().trim()
      );
      
      if (existingApp) {
        alert(`Application dengan nama "${newApp.name}" sudah ada. Gunakan nama yang berbeda.`);
        return;
      }
      
      // Validate manager selection for Leveling applications
      if (newApp.type_level === 'Leveling' && newApp.managers.length === 0) {
        alert('Untuk aplikasi Leveling, pilih minimal 1 manager.');
        return;
      }
      
      try {
        const createdApp = await requestService.createApplication({
          name: newApp.name.trim(), // Trim whitespace
          description: newApp.description.trim(),
          category: newApp.category,
          type_level: newApp.type_level,
          managers: newApp.managers,
          logo: newApp.logo
        });
        
        setApplications([createdApp, ...applications]);
        setNewApp({
          name: '',
          description: '',
          category: '',
          type_level: 'No leveling',
          managers: [],
          logo: DEFAULT_LOGO_URL
        });
        setShowAddForm(false);
        
        console.log('✅ Application created successfully:', createdApp);
      } catch (error) {
        console.error('Error creating application:', error);
        
        // Handle specific database errors
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = (error as any).message;
          if (errorMessage.includes('duplicate key value')) {
            alert('Application dengan nama ini sudah ada. Gunakan nama yang berbeda.');
          } else {
            alert('Gagal membuat application. Silakan coba lagi.');
          }
        } else {
          alert('Gagal membuat application. Silakan coba lagi.');
        }
      }
    } else {
      alert('Mohon isi semua field yang diperlukan.');
    }
  };

  const handleEditApp = (app: Application) => {
    setEditingApp(app);
    setNewApp({
      name: app.name,
      description: app.description,
      category: app.category,
      type_level: app.type_level,
      managers: app.managers || [],
      logo: app.logo
    });
    setShowEditForm(true);
    setNameError(null);
  };

  const handleUpdateApp = async () => {
    if (!editingApp) return;

    if (newApp.name && newApp.description && newApp.category) {
      // Check for duplicate application name (excluding current app)
      const existingApp = applications.find(app => 
        app.id !== editingApp.id && 
        app.name.toLowerCase().trim() === newApp.name.toLowerCase().trim()
      );
      
      if (existingApp) {
        alert(`Application dengan nama "${newApp.name}" sudah ada. Gunakan nama yang berbeda.`);
        return;
      }
      
      // Validate manager selection for Leveling applications
      if (newApp.type_level === 'Leveling' && newApp.managers.length === 0) {
        alert('Untuk aplikasi Leveling, pilih minimal 1 manager.');
        return;
      }
      
      try {
        const updatedApp = await requestService.updateApplication(editingApp.id, {
          name: newApp.name.trim(),
          description: newApp.description.trim(),
          category: newApp.category,
          type_level: newApp.type_level,
          managers: newApp.managers,
          logo: newApp.logo
        });
        
        setApplications(applications.map(app => 
          app.id === editingApp.id ? updatedApp : app
        ));
        
        setNewApp({
          name: '',
          description: '',
          category: '',
          type_level: 'No leveling',
          managers: [],
          logo: DEFAULT_LOGO_URL
        });
        setShowEditForm(false);
        setEditingApp(null);
        
        console.log('✅ Application updated successfully:', updatedApp);
      } catch (error) {
        console.error('Error updating application:', error);
        alert('Gagal mengupdate application. Silakan coba lagi.');
      }
    } else {
      alert('Mohon isi semua field yang diperlukan.');
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingApp(null);
    setNewApp({
      name: '',
      description: '',
      category: '',
      type_level: 'No leveling',
      managers: [],
      logo: DEFAULT_LOGO_URL
    });
    setNameError(null);
  };

  const handleDeleteApp = async (id: string) => {
    if (confirm('Are you sure you want to delete this application? This will also delete all related requests.')) {
      try {
        await requestService.deleteApplication(id);
        setApplications(applications.filter(app => app.id !== id));
        console.log('✅ Application deleted successfully');
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Error deleting application. Please try again.');
      }
    }
  };

  const handleManagerToggle = (manager: string) => {
    setNewApp(prev => ({
      ...prev,
      managers: prev.managers.includes(manager)
        ? prev.managers.filter(m => m !== manager)
        : [...prev.managers, manager]
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB for Supabase Storage)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large. Please choose a file smaller than 2MB.');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      try {
        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('app-logos')
          .upload(fileName, file);
        
        if (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
          return;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('app-logos')
          .getPublicUrl(fileName);
        
        const logoUrl = urlData.publicUrl;
        setNewApp(prev => ({ ...prev, logo: logoUrl }));
        
        console.log('Image uploaded to Supabase Storage:', fileName, 'URL:', logoUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      }
    }
  };

  const handleNameChange = (name: string) => {
    setNewApp(prev => ({ ...prev, name }));
    
    // Clear error if name is empty
    if (!name.trim()) {
      setNameError(null);
      return;
    }
    
    // Check for duplicate name
    const existingApp = applications.find(app => 
      app.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    
    if (existingApp) {
      setNameError(`Application dengan nama "${name}" sudah ada`);
    } else {
      setNameError(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-[#002A58]">Application</h1>
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
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 px-8">

      {/* Add Application Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-[#002A58] mb-4">Add New Application</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  nameError ? 'border-red-300' : 'border-gray-300'
                }`}
                value={newApp.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter application name"
              />
              {nameError && (
                <p className="text-sm text-red-500 mt-1">{nameError}</p>
              )}
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
                  rows={3}
                value={newApp.description}
                onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                  placeholder="Enter application description"
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type Level</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newApp.type_level}
                  onChange={(e) => setNewApp({ ...newApp, type_level: e.target.value as 'Leveling' | 'No leveling' })}
                >
                  <option value="No leveling">No leveling</option>
                  <option value="Leveling">Leveling</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App Logo</label>
              <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
              
              {/* Manager Selection - Show for both Leveling and No leveling */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Managers {newApp.type_level === 'Leveling' ? '(Required for Leveling)' : '(Optional for No Leveling)'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {availableManagers.map(manager => (
                    <label key={manager} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newApp.managers.includes(manager)}
                        onChange={() => handleManagerToggle(manager)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{manager}</span>
                    </label>
                  ))}
                </div>
                {newApp.type_level === 'Leveling' && newApp.managers.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">Pilih minimal 1 manager untuk aplikasi Leveling</p>
                )}
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
                onClick={() => {
                  setShowAddForm(false);
                  setNewApp({
                    name: '',
                    description: '',
                    category: '',
                    type_level: 'No leveling',
                    managers: [],
                    logo: DEFAULT_LOGO_URL
                  });
                }}
              className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Application Form */}
      {showEditForm && editingApp && (
        <div className="bg-white rounded-lg border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-[#002A58] mb-4">Edit Application: {editingApp.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  nameError ? 'border-red-300' : 'border-gray-300'
                }`}
                value={newApp.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter application name"
              />
              {nameError && (
                <p className="text-sm text-red-500 mt-1">{nameError}</p>
              )}
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
                  rows={3}
                value={newApp.description}
                onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                  placeholder="Enter application description"
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type Level</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newApp.type_level}
                  onChange={(e) => setNewApp({ ...newApp, type_level: e.target.value as 'Leveling' | 'No leveling' })}
                >
                  <option value="No leveling">No leveling</option>
                  <option value="Leveling">Leveling</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App Logo</label>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center p-2">
                    <img 
                      src={newApp.logo} 
                      alt={newApp.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <Activity className="h-5 w-5 text-blue-600 hidden" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
            </div>
              
              {/* Manager Selection - Show for both Leveling and No leveling */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Managers {newApp.type_level === 'Leveling' ? '(Required for Leveling)' : '(Optional for No Leveling)'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {availableManagers.map(manager => (
                    <label key={manager} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newApp.managers.includes(manager)}
                        onChange={() => handleManagerToggle(manager)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{manager}</span>
                    </label>
                  ))}
                </div>
                {newApp.type_level === 'Leveling' && newApp.managers.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">Pilih minimal 1 manager untuk aplikasi Leveling</p>
                )}
              </div>
          </div>
          <div className="flex items-center space-x-3 mt-4">
            <button
              onClick={handleUpdateApp}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Application
            </button>
            <button
                onClick={handleCancelEdit}
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
            <h2 className="text-lg font-semibold text-[#002A58]">Applications ({applications.length})</h2>
          </div>
          {applications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first application</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </button>
        </div>
          ) : (
        <div className="divide-y divide-blue-50">
          {applications.map((app) => (
            <div key={app.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center p-2">
                        <img 
                          src={app.logo || DEFAULT_LOGO_URL} 
                          alt={app.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Fallback to default logo if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = DEFAULT_LOGO_URL;
                          }}
                        />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{app.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {app.category}
                      </span>
                          {app.type_level === 'Leveling' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Leveling
                            </span>
                          )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{app.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                            <span className="font-medium">Type Level:</span> {app.type_level}
                      </div>
                          {app.type_level === 'Leveling' && app.managers.length > 0 && (
                      <div>
                              <span className="font-medium">Managers:</span> {app.managers.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditApp(app)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ITAdminAppList;
