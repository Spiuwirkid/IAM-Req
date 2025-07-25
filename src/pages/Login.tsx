import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPage from '../components/AuthPage';

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Profile images for each role
  const profileImages = {
    staff: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    manager_a: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    manager_b: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    manager_c: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
    it_admin: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80'
  };

  // Mock authentication - direct role assignment
  const handleLogin = (email: string, password: string, role: string) => {
    const mockUser = {
      id: '1',
      email,
      name: role === 'staff' ? 'Alex Johnson' : 
            role === 'manager_a' ? 'Sarah Chen' : 
            role === 'manager_b' ? 'Michael Rodriguez' :
            role === 'manager_c' ? 'Emma Thompson' : 'David Kim',
      role,
      department: role === 'staff' ? 'Development' : 
                   role === 'manager_a' ? 'Operations' : 
                   role === 'manager_b' ? 'Development' :
                   role === 'manager_c' ? 'Security' : 'IT Administration',
      avatar: profileImages[role as keyof typeof profileImages]
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsAuthenticated(true);
    
    // Redirect based on role
    if (role === 'staff') {
      navigate('/staff');
    } else if (role.includes('manager')) {
      navigate('/manager-dashboard');
    } else if (role === 'it_admin') {
      navigate('/itadmin');
    }
  };

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setIsAuthenticated(true);
      
      // Redirect based on role
      if (userData.role === 'staff') {
        navigate('/staff');
      } else if (userData.role.includes('manager')) {
        navigate('/manager-dashboard');
      } else if (userData.role === 'it_admin') {
        navigate('/itadmin');
      }
    }
  }, [navigate]);

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return <AuthPage onLogin={handleLogin} />;
};

export default Login; 