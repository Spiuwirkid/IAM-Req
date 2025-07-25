import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService, type User } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'staff' | 'manager' | 'itadmin';
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;
    let authCheckComplete = false;
    let subscription: any = null;
    
    console.log('🔍 ProtectedRoute: Initializing...');
    
    const updateAuthState = (authUser: User | null) => {
      if (!isMounted) return;
      
      setUser(authUser);
      setIsAuthenticated(!!authUser);
      authCheckComplete = true;
      
      if (authUser) {
        console.log('✅ ProtectedRoute: Authenticated as', authUser.role);
      } else {
        console.log('❌ ProtectedRoute: Not authenticated');
      }
    };
    
    const initializeAuth = async () => {
      if (authCheckComplete || !isMounted) return;
      
      try {
        // Get current user with faster timeout
        console.log('🔍 ProtectedRoute: Checking current user...');
        const currentUser = await authService.getCurrentUser();
        updateAuthState(currentUser);

        // Only set up auth listener if we don't have a user yet or if in Supabase mode
        if (!currentUser || authService.isConfigured()) {
          console.log('🔗 ProtectedRoute: Setting up auth listener...');
          const authListener = await authService.onAuthStateChange((authUser) => {
            if (!isMounted) return;
            console.log('🔄 ProtectedRoute: Auth state changed');
            updateAuthState(authUser);
          });
          
          subscription = authListener?.data?.subscription;
        } else {
          console.log('🔧 ProtectedRoute: Using mock auth, no listener needed');
        }
      } catch (error) {
        console.error('💥 ProtectedRoute initialization error:', error);
        // On error, assume not authenticated
        updateAuthState(null);
      }
    };

    // Small delay to avoid race conditions with other auth checks
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        initializeAuth();
      }
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (subscription) {
        console.log('🧹 ProtectedRoute: Cleaning up auth listener');
        subscription.unsubscribe();
      }
    };
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          <p className="text-sm text-gray-500 mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to appropriate login page
  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute: Redirecting to login');
    const redirectPaths = {
      staff: '/staff-login',
      manager: '/manager-a',
      itadmin: '/itadmin-login'
    };
    return <Navigate to={redirectPaths[role]} replace />;
  }

  // Check role permissions
  const hasPermission = () => {
    if (!user) return false;
    
    if (role === 'staff') {
      return user.role === 'staff';
    } else if (role === 'manager') {
      return user.role === 'manager';
    } else if (role === 'itadmin') {
      return user.role === 'itadmin';
    }
    return false;
  };

  if (!hasPermission()) {
    console.log('🚫 ProtectedRoute: Wrong role. User:', user?.role, 'Required:', role);
    const redirectPaths = {
      staff: '/staff-login',
      manager: '/manager-a',
      itadmin: '/itadmin-login'
    };
    return <Navigate to={redirectPaths[role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 