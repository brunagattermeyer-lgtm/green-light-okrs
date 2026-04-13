import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import MainMenu from '@/pages/MainMenu';
import Dashboard from '@/components/okr/Dashboard';
import ContabilPage from '@/pages/ContabilPage';
import FiscalPage from '@/pages/FiscalPage';
import GestaoPessoasPage from '@/pages/GestaoPessoasPage';
import GestaoOperacionalPage from '@/pages/GestaoOperacionalPage';
import { OkrStateProvider } from '@/contexts/OkrStateContext';

interface IndexProps {
  page?: string;
}

const Index = ({ page }: IndexProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-okr-bg">
        <div className="w-8 h-8 border-3 border-okr-fo border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  if (!page) return <MainMenu />;

  if (page === 'okrs') {
    return (
      <OkrStateProvider>
        <Dashboard />
      </OkrStateProvider>
    );
  }

  if (page === 'contabil') return <ContabilPage />;
  if (page === 'fiscal') return <FiscalPage />;
  if (page === 'gestao-pessoas') return <GestaoPessoasPage />;
  if (page === 'gestao-operacional') return <GestaoOperacionalPage />;

  return <MainMenu />;
};

export default Index;
