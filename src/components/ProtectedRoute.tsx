import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'staff' | 'manager' | 'itadmin';
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setIsAuthenticated(true);
      setUserRole(userData.role);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role permissions
  const hasPermission = () => {
    if (role === 'staff') {
      return userRole === 'staff';
    } else if (role === 'manager') {
      return userRole?.includes('manager');
    } else if (role === 'itadmin') {
      return userRole === 'it_admin';
    }
    return false;
  };

  if (!hasPermission()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 