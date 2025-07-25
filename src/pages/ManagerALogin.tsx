import LoginPage from '../components/auth/LoginPage';

const ManagerALogin = () => {
  return (
    <LoginPage
      userType="manager"
      managerLevel="A"
      title="Manager A Login"
      description="First-level approval access for IAM requests"
      redirectPath="/manager"
    />
  );
};

export default ManagerALogin; 