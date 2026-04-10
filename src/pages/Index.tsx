import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/components/okr/Dashboard';
import { OkrStateProvider } from '@/contexts/OkrStateContext';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-okr-bg">
        <div className="w-8 h-8 border-3 border-okr-fo border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <OkrStateProvider>
      <Dashboard />
    </OkrStateProvider>
  );
};

export default Index;
