import React from 'react';
import { useNavigate } from 'react-router-dom';

const GestaoOperacionalPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-okr-bg">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-okr-mi hover:text-okr-dk transition-colors mb-6"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Voltar ao menu
        </button>
        <h1 className="text-xl font-semibold text-okr-dk mb-2">Gestão Operacional</h1>
        <p className="text-sm text-okr-mi">Conteúdo da área de gestão operacional em desenvolvimento.</p>
      </div>
    </div>
  );
};

export default GestaoOperacionalPage;
