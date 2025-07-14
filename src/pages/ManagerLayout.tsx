import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Shield, User, LogOut, Building2, Bell } from 'lucide-react';

const ManagerLayout = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'staff': return 'Staff Member';
      case 'manager_a': return 'Operations Manager';
      case 'manager_b': return 'Development Manager';
      case 'manager_c': return 'Security Manager';
      case 'it_admin': return 'IT Administrator';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'staff': return 'bg-blue-100 text-blue-700';
      case 'manager_a': return 'bg-blue-600 text-white';
      case 'manager_b': return 'bg-blue-600 text-white';
      case 'manager_c': return 'bg-blue-600 text-white';
      case 'it_admin': return 'bg-blue-800 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isActiveRoute = (path: string) => {
    if (path === '/manager') {
      return location.pathname === '/manager';
    }
    return location.pathname.startsWith(path);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative"
         style={{
           backgroundImage: 'url(/bg-cover.png)',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat',
           backgroundAttachment: 'fixed'
         }}>
      {/* Full Background Overlay */}
      <div className="absolute inset-0 bg-black/5"></div>
      
      {/* Main Layout */}
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* App Brand */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <img 
                src="/IAM.png" 
                alt="AccessHub" 
                className="w-20 h-20 object-contain"
              />
              <div>
                <div className="text-xl font-bold text-gray-800">AccessHub</div>
                <div className="text-sm text-gray-500">IAM System</div>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img 
                src={user?.avatar} 
                alt={user?.name} 
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.department}</div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(user?.role || '')}`}>
                  {getRoleDisplayName(user?.role || '')}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="p-4">
            <div className="space-y-1">
              <button 
                onClick={() => navigate('/manager')}
                className={`w-full px-4 py-3 text-left rounded-lg transition-colors flex items-center space-x-3 ${
                  isActiveRoute('/manager') && location.pathname === '/manager'
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                </div>
                <span className="font-medium">Dashboard</span>
              </button>
              
              <button 
                onClick={() => navigate('/manager/requests')}
                className={`w-full px-4 py-3 text-left rounded-lg transition-colors flex items-center space-x-3 ${
                  isActiveRoute('/manager/requests')
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-current rounded"></div>
                </div>
                <span className="font-medium">Requests</span>
              </button>
              
              <button 
                onClick={() => navigate('/manager/campaigns')}
                className={`w-full px-4 py-3 text-left rounded-lg transition-colors flex items-center space-x-3 ${
                  isActiveRoute('/manager/campaigns')
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                    <div className="w-1 h-1 bg-current rounded-sm"></div>
                    <div className="w-1 h-1 bg-current rounded-sm"></div>
                    <div className="w-1 h-1 bg-current rounded-sm"></div>
                    <div className="w-1 h-1 bg-current rounded-sm"></div>
                  </div>
                </div>
                <span className="font-medium">Campaigns</span>
              </button>

              <button 
                onClick={() => navigate('/manager/applications')}
                className={`w-full px-4 py-3 text-left rounded-lg transition-colors flex items-center space-x-3 ${
                  isActiveRoute('/manager/applications')
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-current rounded"></div>
                </div>
                <span className="font-medium">Applications</span>
              </button>
            </div>

            {/* Quick Actions - Right after navigation menu */}
            <div className="mt-6">
              <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">Quick Actions</div>
              <div className="space-y-1">
                <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                  <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">3</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Flexible spacer */}
          <div className="flex-1"></div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Dashboard Content */}
          <div className="flex-1 overflow-auto p-8">
            <Outlet context={{ user }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerLayout; 