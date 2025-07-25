
import { useState } from 'react';
import { User, UserCheck, Settings } from 'lucide-react';

interface AuthPageProps {
  onLogin: (email: string, password: string, role: string) => void;
}

const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showManagerOptions, setShowManagerOptions] = useState(false);

  const roles = [
    {
      id: 'staff',
      name: 'Staff',
      description: 'Request access to applications',
      email: 'staff@company.com',
      color: 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-800',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80'
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Approve access requests',
      email: 'manager@company.com',
      color: 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-800',
      image: 'https://plus.unsplash.com/premium_photo-1661782041556-81e9a21ece9e?q=80&w=150&h=150&fit=crop&crop=face&auto=format&ixlib=rb-4.1.0'
    },
    {
      id: 'it_admin',
      name: 'IT Administrator',
      description: 'Manage system & applications',
      email: 'admin@company.com',
      color: 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-800',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80'
    }
  ];

  const managerOptions = [
    { 
      id: 'manager_a', 
      name: 'Manager A', 
      email: 'manager.a@company.com', 
      department: 'Operations',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face&auto=format&q=80'
    },
    { 
      id: 'manager_b', 
      name: 'Manager B', 
      email: 'manager.b@company.com', 
      department: 'Development',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80'
    },
    { 
      id: 'manager_c', 
      name: 'Manager C', 
      email: 'manager.c@company.com', 
      department: 'Security',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80'
    }
  ];

  const handleRoleSelect = (role: any) => {
    if (role.id === 'manager') {
      // Redirect to unified manager login
      window.location.href = '/manager';
    } else {
      onLogin(role.email, 'demo', role.id);
    }
  };

  const handleManagerSelect = (manager: any) => {
    onLogin(manager.email, 'demo', manager.id);
  };

  const handleBack = () => {
    setShowManagerOptions(false);
    setSelectedRole('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!showManagerOptions ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            
            {/* Simple Header */}
            <div className="text-center mb-8">
              <img 
                src="/IAM.png" 
                alt="IAM Logo" 
                className="w-24 h-24 mx-auto mb-4 object-contain"
              />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                AccessHub
              </h1>
              <p className="text-gray-600">Choose your role to continue</p>
            </div>

            {/* Simple Role Selection with Images */}
            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${role.color}`}
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={role.image} 
                      alt={role.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{role.name}</h3>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            
            {/* Manager Selection Header */}
            <div className="text-center mb-8">
              <img 
                src="/IAM.png" 
                alt="IAM Logo" 
                className="w-16 h-16 mx-auto mb-4 object-contain"
              />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Select Manager Level
              </h1>
              <p className="text-gray-600">Choose your management level</p>
            </div>

            {/* Simple Manager Options with Images */}
            <div className="space-y-3 mb-6">
              {managerOptions.map((manager) => (
                <button
                  key={manager.id}
                  onClick={() => handleManagerSelect(manager)}
                  className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors bg-white text-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={manager.image} 
                      alt={manager.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{manager.name}</h3>
                      <p className="text-sm text-gray-500">{manager.department} Department</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Simple Back Button */}
            <button
              onClick={handleBack}
              className="w-full p-3 text-center text-blue-600 hover:text-blue-800 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
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
