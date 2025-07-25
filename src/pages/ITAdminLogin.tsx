import LoginPage from '../components/auth/LoginPage';

const ITAdminLogin = () => {
  return (
    <LoginPage
      userType="itadmin"
      title="IT Admin Login"
      description="System administration and user management access"
      redirectPath="/itadmin"
    />
  );
};

export default ITAdminLogin; 