import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/services/authService';
import { Shield, Users, ArrowLeft } from 'lucide-react';

const ManagerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate email format for manager accounts
      const managerEmails = ['manager.a@gmail.com', 'manager.b@gmail.com', 'manager.c@gmail.com'];
      
      if (!managerEmails.includes(email.toLowerCase())) {
        setError('Email tidak valid untuk akses manager. Gunakan manager.a@gmail.com, manager.b@gmail.com, atau manager.c@gmail.com');
        return;
      }

      // Login with auth service
      const authResponse = await authService.login(email, password, 'manager');
      
      console.log('🔍 Login result:', authResponse);
      
      // Check if login was successful
      if (authResponse.user && !authResponse.error) {
        // Determine manager type based on email
        let managerType = '';
        if (email.toLowerCase() === 'manager.a@gmail.com') {
          managerType = 'A';
        } else if (email.toLowerCase() === 'manager.b@gmail.com') {
          managerType = 'B';
        } else if (email.toLowerCase() === 'manager.c@gmail.com') {
          managerType = 'C';
        }

        // Store manager type in localStorage for reference
        localStorage.setItem('managerType', managerType);
        
        console.log(`✅ Manager ${managerType} logged in successfully`);
        navigate('/manager-dashboard');
      } else {
        setError(authResponse.error || 'Login gagal. Pastikan email dan password benar.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Manager Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Masuk sebagai Manager untuk review request dan campaign
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Manager
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="manager.a@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
                <p className="text-xs text-gray-500">
                  Gunakan: manager.a@gmail.com, manager.b@gmail.com, atau manager.c@gmail.com
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Masuk sebagai Manager
                  </div>
                )}
              </Button>
            </form>

            {/* Manager Type Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Tipe Manager:</h4>
              <div className="space-y-1 text-xs text-blue-700">
                <div>• <strong>Manager A:</strong> manager.a@gmail.com</div>
                <div>• <strong>Manager B:</strong> manager.b@gmail.com</div>
                <div>• <strong>Manager C:</strong> manager.c@gmail.com</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerLogin; 