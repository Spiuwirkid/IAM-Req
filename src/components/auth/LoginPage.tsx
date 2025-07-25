import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader2, Info } from 'lucide-react';
import { authService, type User } from '../../services/authService';

interface LoginPageProps {
  userType: 'staff' | 'manager' | 'itadmin';
  managerLevel?: 'A' | 'B' | 'C';
  title: string;
  description: string;
  redirectPath: string;
}

const LoginPage = ({ userType, managerLevel, title, description, redirectPath }: LoginPageProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConfigured, setIsConfigured] = useState(true);

  // Check if Supabase is configured
  useEffect(() => {
    setIsConfigured(authService.isConfigured());
  }, []);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        // Redirect to appropriate dashboard
        if (user.role === 'staff') navigate('/staff');
        else if (user.role === 'manager') navigate('/manager');
        else if (user.role === 'itadmin') navigate('/itadmin');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For managers, check specific manager level
      const expectedRole = userType === 'manager' ? 'manager' : userType;
      const { user, error } = await authService.login(email, password, expectedRole);

      if (error) {
        setError(error);
        return;
      }

      if (!user) {
        setError('Login failed. Please try again.');
        return;
      }

      // Additional check for manager level is now handled in authService
      // No additional validation needed here

      // Successful login - redirect
      navigate(redirectPath);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGradientColor = () => {
    if (userType === 'staff') return 'from-blue-600 to-blue-700';
    if (userType === 'manager') return 'from-green-600 to-green-700';
    if (userType === 'itadmin') return 'from-purple-600 to-purple-700';
    return 'from-gray-600 to-gray-700';
  };

  const getIconColor = () => {
    if (userType === 'staff') return 'text-blue-600';
    if (userType === 'manager') return 'text-green-600';
    if (userType === 'itadmin') return 'text-purple-600';
    return 'text-gray-600';
  };

  // Mock credentials based on user type
  const getMockCredentials = () => {
    if (userType === 'staff') return { email: 'staff@company.com', password: 'password123' };
    if (userType === 'manager' && managerLevel === 'A') return { email: 'manager.a@company.com', password: 'password123' };
    if (userType === 'manager' && managerLevel === 'B') return { email: 'manager.b@company.com', password: 'password123' };
    if (userType === 'manager' && managerLevel === 'C') return { email: 'manager.c@company.com', password: 'password123' };
    if (userType === 'itadmin') return { email: 'itadmin@company.com', password: 'password123' };
    return { email: 'manager.a@company.com', password: 'password123' };
  };

  const fillMockCredentials = () => {
    const credentials = getMockCredentials();
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Development Notice */}
        {!isConfigured && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-orange-800">Development Mode</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Supabase is not configured. Using mock authentication for development.
                </p>
                <button
                  onClick={fillMockCredentials}
                  className="mt-2 text-sm bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Use Mock Credentials
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center">
          <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${getGradientColor()} rounded-xl flex items-center justify-center shadow-lg`}>
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-600">{description}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${getIconColor()}`} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${getIconColor()}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Mock Credentials Display */}
            {!isConfigured && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Mock Credentials for {title}:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Email:</strong> {getMockCredentials().email}</p>
                  <p><strong>Password:</strong> {getMockCredentials().password}</p>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className={`w-full py-3 px-4 bg-gradient-to-r ${getGradientColor()} text-white font-medium rounded-lg hover:opacity-90 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              IAM Request System - {title}
              {!isConfigured && (
                <span className="block mt-1 text-orange-600 font-medium">Development Mode</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 