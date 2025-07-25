import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL !== 'your-supabase-url' &&
    import.meta.env.VITE_SUPABASE_ANON_KEY && 
    import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your-supabase-anon-key'
  );
};

// Test actual Supabase connectivity
let connectionTestResult: boolean | null = null;
let connectionTestPromise: Promise<boolean> | null = null;
let lastConnectionTest = 0;
const CONNECTION_TEST_CACHE_DURATION = 30000; // Cache for 30 seconds

const testSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.log('🔧 Supabase not configured, using mock mode');
    return false;
  }

  // Use cached result if recent (within 30 seconds)
  const now = Date.now();
  if (connectionTestResult !== null && (now - lastConnectionTest) < CONNECTION_TEST_CACHE_DURATION) {
    console.log(`🔄 Using cached connection result: ${connectionTestResult ? 'connected' : 'disconnected'}`);
    return connectionTestResult;
  }

  // Return existing promise if test is in progress
  if (connectionTestPromise) {
    return connectionTestPromise;
  }

  console.log('🔌 Testing Supabase connection...');
  
  connectionTestPromise = (async () => {
    try {
      // Test both auth AND database connectivity with shorter timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 1000); // Reduced to 1 second
      });

      // Test actual database endpoint, not just auth
      const testPromise = Promise.all([
        supabase.auth.getSession(), // Test auth
        supabase.from('applications').select('count').limit(1) // Test database
      ]);
      
      await Promise.race([testPromise, timeoutPromise]);
      
      console.log('✅ Supabase connection successful (auth + database)');
      connectionTestResult = true;
      lastConnectionTest = now;
      return true;
    } catch (error: any) {
      console.log('❌ Supabase connection failed:', error.message);
      console.log('🔄 Using mock mode for better performance');
      connectionTestResult = false;
      lastConnectionTest = now;
      return false;
    } finally {
      connectionTestPromise = null;
    }
  })();

  return connectionTestPromise;
};

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'staff' | 'manager' | 'itadmin';
  manager_level?: 'A' | 'B' | 'C'; // For managers only
  department?: string;
  avatar?: string; // Profile picture URL or base64
  is_active?: boolean;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

class AuthService {
  private currentUser: User | null = null;

  // Detect user role and details from email pattern
  private getUserFromEmail(email: string, authId: string): User {
    const emailLower = email.toLowerCase();
    
    // Determine role and details based on email pattern
    let role: 'staff' | 'manager' | 'itadmin' = 'staff';
    let name = 'User';
    let manager_level: 'A' | 'B' | 'C' | undefined = undefined;
    
    if (emailLower.includes('manager.a') || emailLower.includes('managera')) {
      role = 'manager';
      manager_level = 'A';
      name = 'Manager A';
    } else if (emailLower.includes('manager.b') || emailLower.includes('managerb')) {
      role = 'manager';
      manager_level = 'B';
      name = 'Manager B';
    } else if (emailLower.includes('manager.c') || emailLower.includes('managerc')) {
      role = 'manager';
      manager_level = 'C';
      name = 'Manager C';
    } else if (emailLower.includes('itadmin') || emailLower.includes('admin')) {
      role = 'itadmin';
      name = 'IT Admin';
    } else if (emailLower.includes('staff')) {
      role = 'staff';
      name = 'Staff User';
    } else {
      // Default fallback - assume staff for any other email
      role = 'staff';
      name = email.split('@')[0]; // Use email prefix as name
    }

    return {
      id: authId,
      email: email,
      name: name,
      role: role,
      manager_level: manager_level,
      department: 'IT Department',
      is_active: true
    };
  }

  // Login with email and password using Supabase Auth
  async login(email: string, password: string, expectedRole?: string): Promise<AuthResponse> {
    try {
      // Test Supabase connectivity first
      const supabaseConnected = await testSupabaseConnection();
      
      if (!supabaseConnected) {
        console.log('🔧 Using mock login due to connectivity issues');
        return this.mockLogin(email, password, expectedRole);
      }

      console.log('🔌 Using Supabase login');
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.log('❌ Supabase login error:', authError.message);
        // Fall back to mock on auth error
        return this.mockLogin(email, password, expectedRole);
      }

      if (!authData.user) {
        return { user: null, error: 'Login failed' };
      }

      // Create user object from auth data and email pattern
      const user = this.getUserFromEmail(authData.user.email!, authData.user.id);

      // Check if user role matches expected role (for specific login pages)
      if (expectedRole && user.role !== expectedRole) {
        await this.logout();
        return { user: null, error: `Access denied. This login is for ${expectedRole} only.` };
      }

      // Additional check for manager level
      if (expectedRole === 'manager') {
        const expectedLevels = {
          'manager.a@gmail.com': 'A',
          'manager.b@gmail.com': 'B',
          'manager.c@gmail.com': 'C'
        };
        
        const expectedLevel = expectedLevels[email.toLowerCase() as keyof typeof expectedLevels];
        if (expectedLevel && user.manager_level !== expectedLevel) {
          await this.logout();
          return { user: null, error: `Access denied. This login is for Manager ${expectedLevel} only.` };
        }
      }

      this.currentUser = user;
      return { user, error: null };
    } catch (error) {
      console.error('💥 Login error:', error);
      // Final fallback to mock
      return this.mockLogin(email, password, expectedRole);
    }
  }

  // Mock login for development when Supabase is not configured
  private mockLogin(email: string, password: string, expectedRole?: string): AuthResponse {
    // Mock users for development
    const mockUsers: { [email: string]: User & { password: string } } = {
      'staff@gmail.com': {
        id: 'staff_user_1',
        email: 'staff@gmail.com',
        name: 'Staff User',
        role: 'staff',
        department: 'IT Department',
        password: 'password123'
      },
      'staff@company.com': {
        id: 'staff_user_1',
        email: 'staff@company.com',
        name: 'Alex Johnson',
        role: 'staff',
        department: 'IT Department',
        password: 'password123'
      },
      'manager.a@gmail.com': {
        id: 'manager_a',
        email: 'manager.a@gmail.com',
        name: 'Manager A',
        role: 'manager',
        manager_level: 'A',
        department: 'IT Department',
        password: 'password123'
      },
      'manager.b@gmail.com': {
        id: 'manager_b',
        email: 'manager.b@gmail.com',
        name: 'Manager B',
        role: 'manager',
        manager_level: 'B',
        department: 'IT Department',
        password: 'password123'
      },
      'manager.c@gmail.com': {
        id: 'manager_c',
        email: 'manager.c@gmail.com',
        name: 'Manager C',
        role: 'manager',
        manager_level: 'C',
        department: 'IT Department',
        password: 'password123'
      },
      'itadmin@company.com': {
        id: 'itadmin_1',
        email: 'itadmin@company.com',
        name: 'IT Admin',
        role: 'itadmin',
        department: 'IT Department',
        password: 'password123'
      }
    };

    const mockUser = mockUsers[email.toLowerCase()];
    
    if (!mockUser) {
      return { user: null, error: 'User not found' };
    }

    if (mockUser.password !== password) {
      return { user: null, error: 'Invalid password' };
    }

    // Check role for specific login pages
    if (expectedRole && mockUser.role !== expectedRole) {
      return { user: null, error: `Access denied. This login is for ${expectedRole} only.` };
    }

    const { password: _, ...user } = mockUser;
    this.currentUser = user;
    
    // Store in localStorage for persistence
    localStorage.setItem('authUser', JSON.stringify(user));
    
    return { user, error: null };
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Always clear current user and localStorage first
      this.currentUser = null;
      localStorage.removeItem('authUser');
      
      // Test Supabase connectivity
      const supabaseConnected = await testSupabaseConnection();
      
      if (supabaseConnected) {
        console.log('🔌 Using Supabase logout');
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.log('❌ Supabase logout error (but local logout succeeded):', error.message);
          } else {
            console.log('✅ Supabase logout successful');
          }
        } catch (signOutError) {
          console.log('❌ Supabase logout failed (but local logout succeeded):', signOutError);
        }
      } else {
        console.log('🔧 Mock logout (Supabase not available)');
      }
      
      // Reset all connection test caches on logout
      connectionTestResult = null;
      lastConnectionTest = 0;
      
      // Also clear request service cache if it exists
      try {
        // @ts-ignore - accessing private variable from requestService
        if (window.__resetRequestServiceCache) {
          window.__resetRequestServiceCache();
        }
      } catch (e) {
        // Ignore if not available
      }
      
      console.log('✅ Local logout completed');
    } catch (error) {
      console.error('💥 Logout error:', error);
      // Even if logout fails, ensure local state is cleared
      this.currentUser = null;
      localStorage.removeItem('authUser');
      connectionTestResult = null;
      lastConnectionTest = 0;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      // First test if Supabase is actually reachable
      const supabaseConnected = await testSupabaseConnection();
      
      if (!supabaseConnected) {
        console.log('🔧 Using mock auth due to connectivity issues');
        // Use mock user from localStorage
        if (this.currentUser) {
          return this.currentUser;
        }
        
        const savedUser = localStorage.getItem('authUser');
        if (savedUser) {
          this.currentUser = JSON.parse(savedUser);
          return this.currentUser;
        }
        
        return null;
      }

      // Supabase is connected, proceed with real auth
      console.log('🔌 Using Supabase auth');
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.log('❌ Supabase auth error:', error.message);
        // Fall back to mock on error
        return this.getMockUserFallback();
      }
      
      if (!authUser) {
        this.currentUser = null;
        return null;
      }

      // Create user object from auth data
      const user = this.getUserFromEmail(authUser.email!, authUser.id);
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('💥 Error getting current user:', error);
      // Final fallback to mock
      return this.getMockUserFallback();
    }
  }

  // Helper method for mock user fallback
  private getMockUserFallback(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      return this.currentUser;
    }
    
    return null;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    let hasInitialized = false;
    
    const initializeAuth = async () => {
      // Prevent duplicate initialization
      if (hasInitialized) {
        console.log('🔄 Auth already initialized, skipping...');
        return {
          data: {
            subscription: {
              unsubscribe: () => console.log('🔧 Duplicate auth listener unsubscribed')
            }
          }
        };
      }
      
      hasInitialized = true;
      
      // Test connectivity first
      const supabaseConnected = await testSupabaseConnection();
      
      if (!supabaseConnected) {
        console.log('🔧 Using mock auth state monitoring');
        // For mock auth, immediately call callback with current state
        const checkCurrentUser = async () => {
          const currentUser = await this.getCurrentUser();
          callback(currentUser);
        };
        
        // Call immediately to set initial state
        checkCurrentUser();
        
        // Return a mock subscription
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                console.log('🔧 Mock auth listener unsubscribed');
                hasInitialized = false;
              }
            }
          }
        };
      }

      console.log('🔌 Using Supabase auth state monitoring');
      
      // Track last user to prevent duplicate callbacks
      let lastUserId: string | null = null;
      
      // Real Supabase auth state change listener
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          const currentUserId = session?.user?.id || null;
          
          // Skip duplicate events for same user
          if (currentUserId === lastUserId && event !== 'SIGNED_IN') {
            console.log('🔄 Skipping duplicate auth event for same user');
            return;
          }
          
          lastUserId = currentUserId;
          console.log('🔄 Auth state changed:', event, session?.user?.email);
          
          if (session?.user) {
            const user = this.getUserFromEmail(session.user.email!, session.user.id);
            this.currentUser = user;
            callback(user);
          } else {
            this.currentUser = null;
            callback(null);
          }
        } catch (error) {
          console.error('💥 Auth state change error:', error);
          // Fall back to mock user if available
          const mockUser = this.getMockUserFallback();
          callback(mockUser);
        }
      });

      return { 
        data: {
          ...data,
          subscription: {
            ...data.subscription,
            unsubscribe: () => {
              hasInitialized = false;
              data.subscription?.unsubscribe();
            }
          }
        }
      };
    };

    // Return the initialization promise that resolves to subscription data
    return initializeAuth().catch(error => {
      console.error('💥 Auth initialization error:', error);
      hasInitialized = false;
      // Emergency fallback
      const mockUser = this.getMockUserFallback();
      callback(mockUser);
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.log('🔧 Emergency mock auth listener unsubscribed');
            }
          }
        }
      };
    });
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return !!this.currentUser || !!localStorage.getItem('authUser');
    }

    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }

  // Get managers for approval workflow
  async getManagers(): Promise<User[]> {
    try {
      // Return predefined managers structure
      const managers: User[] = [
        {
          id: 'manager_a',
          email: 'manager.a@company.com',
          name: 'Manager A',
          role: 'manager',
          manager_level: 'A',
          department: 'IT Department'
        },
        {
          id: 'manager_b',
          email: 'manager.b@company.com',
          name: 'Manager B',
          role: 'manager',
          manager_level: 'B',
          department: 'IT Department'
        },
        {
          id: 'manager_c',
          email: 'manager.c@company.com',
          name: 'Manager C',
          role: 'manager',
          manager_level: 'C',
          department: 'IT Department'
        }
      ];

      return managers;
    } catch (error) {
      console.error('Error fetching managers:', error);
      return [];
    }
  }

  // Update user profile
  async updateProfile(updates: { name?: string; avatar?: string }): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      // Test Supabase connectivity first
      const supabaseConnected = await testSupabaseConnection();
      
      if (!supabaseConnected) {
        console.log('🔧 Using mock profile update due to connectivity issues');
        // Mock update for development
        if (updates.name) {
          this.currentUser.name = updates.name;
        }
        if (updates.avatar !== undefined) {
          this.currentUser.avatar = updates.avatar;
        }
        
        // Update localStorage
        localStorage.setItem('authUser', JSON.stringify(this.currentUser));
        
        // Trigger auth state change
        this.notifyAuthStateChange(this.currentUser);
        return;
      }

      console.log('🔌 Using Supabase profile update');
      // Real Supabase update
      const { error } = await supabase.auth.updateUser({
        data: {
          name: updates.name || this.currentUser.name,
          avatar: updates.avatar || this.currentUser.avatar
        }
      });

      if (error) {
        console.log('❌ Supabase profile update error:', error.message);
        // Fall back to mock update on error
        if (updates.name) {
          this.currentUser.name = updates.name;
        }
        if (updates.avatar !== undefined) {
          this.currentUser.avatar = updates.avatar;
        }
        localStorage.setItem('authUser', JSON.stringify(this.currentUser));
        this.notifyAuthStateChange(this.currentUser);
        return;
      }

      // Update current user on success
      if (updates.name) {
        this.currentUser.name = updates.name;
      }
      if (updates.avatar !== undefined) {
        this.currentUser.avatar = updates.avatar;
      }

      // Trigger auth state change
      this.notifyAuthStateChange(this.currentUser);
    } catch (error) {
      console.error('💥 Error updating profile:', error);
      // Final fallback to mock update
      if (!this.currentUser) throw error;
      
      if (updates.name) {
        this.currentUser.name = updates.name;
      }
      if (updates.avatar !== undefined) {
        this.currentUser.avatar = updates.avatar;
      }
      localStorage.setItem('authUser', JSON.stringify(this.currentUser));
      this.notifyAuthStateChange(this.currentUser);
    }
  }

  // Helper method to notify auth state changes
  private notifyAuthStateChange(user: User | null) {
    // This would be called to notify all listeners about auth state changes
    // For now, we'll rely on the periodic checks and manual updates
  }

  // Check if Supabase is configured
  isConfigured(): boolean {
    return isSupabaseConfigured();
  }
}

export const authService = new AuthService(); 