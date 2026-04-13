import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GLOSSARIO } from '@/data/okrData';
import logoAtlc from '@/assets/logo-atlc-cropped.png';

const MENU_ITEMS = [
  { label: 'OKRs', path: '/okrs', icon: '🎯' },
  { label: 'Contábil', path: '/contabil', icon: '📊' },
  { label: 'Fiscal', path: '/fiscal', icon: '📋' },
  { label: 'Gestão de Pessoas', path: '/gestao-pessoas', icon: '👥' },
  { label: 'Gestão Operacional', path: '/gestao-operacional', icon: '⚙️', restricted: true },
];

const ALLOWED_GESTAO_EMAIL = 'bruna.gattermeyer@atlantico.digital';

const MainMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'menu' | 'glossario'>('menu');
  const [permError, setPermError] = useState('');

  const handleNav = (item: typeof MENU_ITEMS[0]) => {
    setPermError('');
    if (item.restricted && user?.email !== ALLOWED_GESTAO_EMAIL) {
      setPermError('Você não tem permissão para acessar essa página.');
      return;
    }
    navigate(item.path);
  };

  return (
    <div className="min-h-screen bg-okr-bg">
      <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* User bar */}
        <div className="flex items-center justify-end gap-3 mb-8 text-xs text-okr-lt">
          <span>{user?.email}</span>
          <button onClick={signOut} className="px-3 py-1 rounded bg-okr-bl hover:bg-okr-bo transition-colors text-okr-mi">
            Sair
          </button>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoAtlc} alt="ATLC Igrejas" className="h-16 mb-3" />
          <h1 className="text-xl font-semibold text-okr-dk">Painel do Time</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-okr-bl rounded-lg p-0.5 w-fit mx-auto">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'menu' ? 'bg-okr-su text-okr-dk shadow-sm' : 'text-okr-mi hover:text-okr-dk'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab('glossario')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'glossario' ? 'bg-okr-su text-okr-dk shadow-sm' : 'text-okr-mi hover:text-okr-dk'
            }`}
          >
            Glossário
          </button>
        </div>

        {activeTab === 'menu' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MENU_ITEMS.map(item => (
                <button
                  key={item.label}
                  onClick={() => handleNav(item)}
                  className="bg-okr-su rounded-xl p-5 shadow-[0_2px_8px_rgba(13,38,1,0.08),0_6px_20px_rgba(13,38,1,0.06)] text-left hover:shadow-[0_4px_16px_rgba(13,38,1,0.12),0_8px_32px_rgba(13,38,1,0.08)] hover:-translate-y-0.5 hover:border-okr-bo border border-transparent transition-all duration-300"
                >
                  <div className="text-lg font-semibold text-okr-dk">{item.label}</div>
                  <div className="text-xs text-okr-mi mt-1">Acessar {item.label.toLowerCase()}</div>
                </button>
              ))}
            </div>
            {permError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                {permError}
              </div>
            )}
          </>
        )}

        {activeTab === 'glossario' && (
          <div className="bg-okr-su rounded-xl shadow-[0_2px_8px_rgba(13,38,1,0.08),0_6px_20px_rgba(13,38,1,0.06)] overflow-hidden border border-transparent">
            <table className="w-full">
              <tbody>
                {GLOSSARIO.map((g, i) => (
                  <tr key={g.termo} className={i > 0 ? 'border-t border-okr-bl' : ''}>
                    <td className="px-4 py-3 text-xs font-bold text-okr-dk w-32 align-top">{g.termo}</td>
                    <td className="px-4 py-3 text-[13px] text-okr-mi">{g.def}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMenu;
