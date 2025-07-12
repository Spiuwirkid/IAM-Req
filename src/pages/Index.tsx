
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
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">IAM System</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user?.name}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                {getRoleDisplayName(userRole || '')}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Manager Dashboard</h2>
            <p className="text-muted-foreground">Manager approval interface coming soon</p>
          </div>
        )}
        {userRole === 'it_admin' && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">IT Admin Panel</h2>
            <p className="text-muted-foreground">Administrative interface coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
