import LoginPage from '../components/auth/LoginPage';

const ManagerCLogin = () => {
  return (
    <LoginPage
      userType="manager"
      managerLevel="C"
      title="Manager C Login"
      description="Final-level approval access for IAM requests"
      redirectPath="/manager"
    />
  );
};

export default ManagerCLogin; 