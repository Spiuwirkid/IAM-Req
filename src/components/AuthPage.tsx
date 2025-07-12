
import { useState } from 'react';
import { Shield, User, UserCheck, Settings } from 'lucide-react';

interface AuthPageProps {
  onLogin: (email: string, password: string, role: string) => void;
}

const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const roles = [
    {
      id: 'staff',
      name: 'Staff User',
      description: 'Request access to applications',
      icon: User,
      email: 'staff@iam.com'
    },
    {
      id: 'manager_a',
      name: 'Manager',
      description: 'Approve access requests',
      icon: UserCheck,
      email: 'manager.a@iam.com'
    },
    {
      id: 'it_admin',
      name: 'IT Admin',
      description: 'Manage applications and campaigns',
      icon: Settings,
      email: 'admin@iam.com'
    }
  ];

  const handleRoleSelect = (role: any) => {
    setSelectedRole(role.id);
    setEmail(role.email);
    setShowLoginForm(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, selectedRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {!showLoginForm ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">IAM System</h1>
              <p className="text-gray-600">Identity & Access Management</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select your role:</h2>
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <IconComponent className="h-6 w-6 text-blue-600 mr-3 group-hover:text-blue-700" />
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-900">
                          {role.name}
                        </h3>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">
                Signing in as {roles.find(r => r.id === selectedRole)?.name}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter any password for demo"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In
              </button>
            </form>

            <button
              onClick={() => {
                setShowLoginForm(false);
                setSelectedRole('');
                setEmail('');
                setPassword('');
              }}
              className="w-full mt-4 text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              ← Back to role selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
