import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPage from '../components/AuthPage';
import StaffDashboard from '../components/staff/StaffDashboard';
import ManagerDashboard from '../components/manager/ManagerDashboard';
import ITAdminDashboard from '../components/itadmin/ITAdminDashboard';
import { Shield } from 'lucide-react';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Mock authentication - direct role assignment
  const handleLogin = (email: string, password: string, role: string) => {
    const mockUser = {
      id: '1',
      email,
      name: role === 'staff' ? 'Staff User' : 
            role === 'manager_a' ? 'Manager A' : 
            role === 'manager_b' ? 'Manager B' :
            role === 'manager_c' ? 'Manager C' : 'IT Admin',
      role
    };
    
    setUser(mockUser);
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setUserRole(userData.role);
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'staff': return 'Staff';
      case 'manager_a': return 'Manager A';
      case 'manager_b': return 'Manager B';
      case 'manager_c': return 'Manager C';
      case 'it_admin': return 'IT Admin';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">IAM System</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {getRoleDisplayName(userRole || '')}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-6">
        {userRole === 'staff' && <StaffDashboard user={user} />}
        {(userRole === 'manager_a' || userRole === 'manager_b' || userRole === 'manager_c') && (
          <ManagerDashboard user={user} />
        )}
        {userRole === 'it_admin' && <ITAdminDashboard user={user} />}
      </main>
    </div>
  );
};

export default Index;
