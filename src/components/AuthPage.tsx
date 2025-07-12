
import { useState } from 'react';
import { Shield, User, UserCheck, Settings } from 'lucide-react';

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
      icon: User,
      email: 'staff@iam.com'
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Approve access requests',
      icon: UserCheck,
      email: 'manager@iam.com'
    },
    {
      id: 'it_admin',
      name: 'IT Admin',
      description: 'Manage applications',
      icon: Settings,
      email: 'admin@iam.com'
    }
  ];

  const managerOptions = [
    { id: 'manager_a', name: 'Manager A', email: 'manager.a@iam.com' },
    { id: 'manager_b', name: 'Manager B', email: 'manager.b@iam.com' },
    { id: 'manager_c', name: 'Manager C', email: 'manager.c@iam.com' }
  ];

  const handleRoleSelect = (role: any) => {
    if (role.id === 'manager') {
      setSelectedRole('manager');
      setShowManagerOptions(true);
    } else {
      // Direct login without password for other roles
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {!showManagerOptions ? (
          <div className="bg-card rounded-xl shadow-sm border p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">IAM System</h1>
                <p className="text-muted-foreground">Select your role to continue</p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    className="w-full p-4 text-left border border-border rounded-lg hover:bg-accent hover:border-primary transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{role.name}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-sm border p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <UserCheck className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Select Manager</h1>
                <p className="text-muted-foreground">Choose your manager role</p>
              </div>
            </div>

            {/* Manager Options */}
            <div className="space-y-3">
              {managerOptions.map((manager) => (
                <button
                  key={manager.id}
                  onClick={() => handleManagerSelect(manager)}
                  className="w-full p-4 text-left border border-border rounded-lg hover:bg-accent hover:border-primary transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{manager.name}</h3>
                      <p className="text-sm text-muted-foreground">Manager approval role</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Back Button */}
            <button
              onClick={handleBack}
              className="w-full p-3 text-center text-muted-foreground hover:text-foreground transition-colors"
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
