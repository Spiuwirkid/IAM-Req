import LoginPage from '../components/auth/LoginPage';

const ManagerBLogin = () => {
  return (
    <LoginPage
      userType="manager"
      managerLevel="B"
      title="Manager B Login"
      description="Second-level approval access for IAM requests"
      redirectPath="/manager"
    />
  );
};

export default ManagerBLogin; 