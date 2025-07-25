import LoginPage from '../components/auth/LoginPage';

const StaffLogin = () => {
  return (
    <LoginPage
      userType="staff"
      title="Staff Login"
      description="Access your IAM dashboard and request applications"
      redirectPath="/staff"
    />
  );
};

export default StaffLogin; 