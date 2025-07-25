# Database Setup Guide - Supabase Auth Integration

## 🎯 **Overview**

This guide will help you set up the IAM Request System with **pure Supabase Authentication** - no custom users table needed! Users are created directly in Supabase Auth dashboard and roles are detected from email patterns.

## 🏗️ **Architecture**

- **Authentication**: Pure Supabase Auth (no custom users table)
- **Role Detection**: Automatic based on email patterns
- **User Management**: Create users directly in Supabase Auth dashboard
- **Permissions**: Handled by application logic with role-based access

## 📋 **Prerequisites**

1. Supabase project created
2. Database access to your Supabase project
3. Environment variables configured

## 🛠️ **Step 1: Configure Environment Variables**

Create `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🗄️ **Step 2: Run Database Schema**

Copy and execute the entire `database-schema.sql` file in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `database-schema.sql`
3. Paste and run the script
4. ✅ All tables, indexes, and sample data will be created

## 👥 **Step 3: Create Users in Supabase Auth**

### **Option A: Via Supabase Dashboard (Recommended)**

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **"Add user"** 
3. Create users with these email patterns:

#### **Staff Users**
```
staff@company.com          → Role: staff
staff@gmail.com           → Role: staff  
employee1@company.com     → Role: staff (any email becomes staff by default)
```

#### **Manager Users**
```
manager.a@company.com     → Role: manager, Level: A
manager.b@company.com     → Role: manager, Level: B  
manager.c@company.com     → Role: manager, Level: C
```

#### **IT Admin Users**
```
itadmin@company.com       → Role: itadmin
admin@company.com         → Role: itadmin
```

### **Option B: Via SQL (Alternative)**

If you prefer SQL, you can also create auth users via Supabase functions, but Dashboard is easier.

## 🔐 **Step 4: Role Detection Logic**

The system automatically detects user roles from email patterns:

```typescript
// Email Pattern → Role Detection
if (email.includes('manager.a'))     → Manager A
if (email.includes('manager.b'))     → Manager B  
if (email.includes('manager.c'))     → Manager C
if (email.includes('itadmin'))       → IT Admin
if (email.includes('staff'))         → Staff
else                                 → Staff (default)
```

## 🧪 **Step 5: Test the System**

### **Development Mode (Mock)**
If Supabase is not configured, the system uses mock authentication:

```typescript
// Mock credentials for testing
staff@gmail.com / password123        → Staff User
manager.a@company.com / password123  → Manager A
manager.b@company.com / password123  → Manager B
manager.c@company.com / password123  → Manager C
itadmin@company.com / password123    → IT Admin
```

### **Production Mode (Real Supabase)**
Users login with actual Supabase Auth credentials you created in Step 3.

## 🌐 **Step 6: Login Pages**

The system provides separate login pages for each user type:

- **Staff**: `/staff-login`
- **Manager A**: `/manager-a` 
- **Manager B**: `/manager-b`
- **Manager C**: `/manager-c`
- **IT Admin**: `/itadmin-login`

Each page validates that the user has the correct role before allowing access.

## 📊 **Step 7: Verify Installation**

1. **Check Tables**: Verify all tables are created in Supabase Dashboard
2. **Check Sample Data**: 8 sample applications should be visible
3. **Test Authentication**: Try logging in with created users
4. **Test Workflow**: Create a request and test approval flow

## 🔄 **Approval Workflow**

### **Leveling Applications**
- **Level 1**: Manager A approval
- **Level 2**: Manager B approval  
- **Level 3**: Manager C approval
- **Result**: Sequential approval required

### **No-Leveling Applications** 
- **Level 1**: IT Admin approval only
- **Result**: Single approval required

## 🚨 **Troubleshooting**

### **"Invalid URL" Error**
- Check your `.env` file has correct `VITE_SUPABASE_URL`
- Restart your development server after changing `.env`

### **"User not found" Error**
- Verify user exists in Supabase Auth → Users
- Check email spelling and case sensitivity
- Ensure user has correct email pattern for role detection

### **"Access denied" Error**
- User role doesn't match the login page 
- Example: Staff user trying to login via Manager A page
- Use the correct login URL for user's role

### **Database Connection Issues**
- Verify Supabase project is active
- Check `VITE_SUPABASE_ANON_KEY` is correct
- Ensure RLS policies are properly set

## 📝 **Database Tables Created**

- ✅ `applications` - Available applications for access
- ✅ `requests` - User access requests
- ✅ `approval_workflow` - Multi-level approval tracking
- ✅ `access_permissions` - Granted permissions audit
- ✅ `audit_log` - System activity logging

## 🔒 **Security Features**

- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control** via application logic
- **Email pattern validation** for manager levels
- **Audit logging** for all critical actions
- **Automatic updated_at timestamps** via triggers

## ✅ **Success Indicators**

1. ✅ Environment variables configured
2. ✅ Database schema executed successfully  
3. ✅ Users created in Supabase Auth
4. ✅ Can login with appropriate user roles
5. ✅ Request creation and approval workflow functions
6. ✅ Role-based dashboard access working

Your IAM Request System is now ready! 🎉 