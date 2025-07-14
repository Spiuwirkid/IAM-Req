import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      
      // Redirect based on role
      if (userData.role === 'staff') {
        navigate('/staff');
      } else if (userData.role.includes('manager')) {
        navigate('/manager');
      } else if (userData.role === 'it_admin') {
        navigate('/itadmin');
      }
    } else {
      // No user logged in, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
        </div>
    </div>
  );
};

export default Index;
