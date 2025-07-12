
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPage from '../components/AuthPage';
import StaffDashboard from '../components/staff/StaffDashboard';
import { Shield } from 'lucide-react';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Mock authentication - in real app this would use Supabase
  const handleLogin = (email: string, password: string, role: string) => {
    // Simulate authentication
    const mockUser = {
      id: '1',
      email,
      name: role === 'staff' ? 'John Staff' : role === 'manager_a' ? 'Manager A' : 'IT Admin',
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">IAM System</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {userRole?.replace('_', ' ').toUpperCase()}
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
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {userRole === 'staff' && <StaffDashboard user={user} />}
        {userRole === 'manager_a' && (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Manager Dashboard</h2>
            <p className="text-gray-600">Manager approval interface coming soon</p>
          </div>
        )}
        {userRole === 'it_admin' && (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">IT Admin Panel</h2>
            <p className="text-gray-600">Administrative interface coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
