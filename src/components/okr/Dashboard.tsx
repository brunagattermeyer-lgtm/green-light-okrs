import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, AREAS, KRS, OBJETIVOS, CRONOGRAMA, KrKey, AreaKey } from '@/data/okrData';
import { useOkrState } from '@/contexts/OkrStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { calcOverallProgress, calcProgressByKr, calcProgressByArea } from '@/lib/progressCalc';
import { supabase } from '@/integrations/supabase/client';
import ProgressBar from '@/components/okr/ProgressBar';
import AreaModal from '@/components/okr/AreaModal';
import ObjetivosModal from '@/components/okr/ObjetivosModal';
import KrListModal from '@/components/okr/KrListModal';
import KrDetailModal from '@/components/okr/KrDetailModal';
import AllActionsModal from '@/components/okr/AllActionsModal';
import OkrCharts from '@/components/okr/OkrCharts';
import DeadlineAlerts from '@/components/okr/DeadlineAlerts';
import ActivityLogSidebar from '@/components/okr/ActivityLogSidebar';
import ActionFormModal from '@/components/okr/ActionFormModal';
import SpreadsheetImportModal from '@/components/okr/SpreadsheetImportModal';
import logoAtlc from '@/assets/logo-atlc-cropped.png';

const QUARTERS = [
  { label: '1Q2026', period: 'Janeiro — Março 2026' },
  { label: '2Q2026', period: 'Abril — Junho 2026' },
  { label: '3Q2026', period: 'Julho — Setembro 2026' },
  { label: '4Q2026', period: 'Outubro — Dezembro 2026' },
];

const Dashboard: React.FC = () => {
  const { actionStates, chipStates, loading } = useOkrState();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeArea, setActiveArea] = useState<AreaKey | null>(null);
  const [showObjetivos, setShowObjetivos] = useState(false);
  const [showKrList, setShowKrList] = useState(false);
  const [showAllActions, setShowAllActions] = useState(false);
  const [activeKr, setActiveKr] = useState<KrKey | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'charts'>('dashboard');
  const [showCreateAction, setShowCreateAction] = useState(false);
  const [showSpreadsheets, setShowSpreadsheets] = useState(false);
  const [spreadsheetImports, setSpreadsheetImports] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('spreadsheet_imports').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setSpreadsheetImports(data || []));
  }, []);

  const refreshSpreadsheets = () => {
    supabase.from('spreadsheet_imports').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setSpreadsheetImports(data || []));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-okr-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-okr-fo border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-okr-lt">Carregando OKRs...</span>
        </div>
      </div>
    );
  }

  const overall = calcOverallProgress(actionStates, chipStates);
  const quarter = QUARTERS[selectedQuarter];

  return (
    <div className="min-h-screen bg-okr-bg">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-20">
        {/* User bar */}
        <div className="flex items-center justify-between gap-3 mb-6 text-xs text-okr-lt">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-okr-mi hover:text-okr-dk transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Voltar ao menu
          </button>
          <div className="flex items-center gap-3">
            <span>{user?.email}</span>
            <button onClick={signOut} className="px-3 py-1 rounded bg-okr-bl hover:bg-okr-bo transition-colors text-okr-mi">
              Sair
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="px-2 py-1 rounded bg-okr-bl hover:bg-okr-bo transition-colors text-okr-mi text-sm font-bold"
              >
                ...
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-okr-su border border-okr-bl rounded-lg shadow-modal z-40 min-w-[180px]">
                    <button
                      onClick={() => { setShowLog(true); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-okr-dk hover:bg-okr-bl transition-colors rounded-t-lg"
                    >
                      Mostrar log
                    </button>
                    <button
                      onClick={() => { setShowSpreadsheets(true); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-okr-dk hover:bg-okr-bl transition-colors"
                    >
                      Planilhas importadas
                    </button>
                    <button
                      onClick={() => { setShowCreateAction(true); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-okr-dk hover:bg-okr-bl transition-colors rounded-b-lg"
                    >
                      Nova ação
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col items-center gap-2 mb-2">
            <img src={logoAtlc} alt="ATLC Igrejas" className="h-16" />
            <div className="relative">
              <button
                onClick={() => setShowQuarterDropdown(!showQuarterDropdown)}
                className="bg-okr-dk text-[#a8d8a8] text-[11px] font-medium tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 hover:bg-okr-mi transition-colors"
              >
                {quarter.label}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {showQuarterDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowQuarterDropdown(false)} />
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-okr-su border border-okr-bl rounded-lg shadow-modal z-40 min-w-[160px] py-1">
                    {QUARTERS.map((q, i) => (
                      <button
                        key={q.label}
                        onClick={() => { setSelectedQuarter(i); setShowQuarterDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                          i === selectedQuarter ? 'bg-okr-bl text-okr-dk font-medium' : 'text-okr-mi hover:bg-okr-bl'
                        }`}
                      >
                        {q.label} — {q.period}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <h1 className="text-[26px] font-semibold text-okr-dk tracking-tight text-center">OKRs — Gestão Operacional</h1>
          <p className="text-sm text-okr-mi mt-1 text-center">{quarter.period} · 2 objetivos · 4 resultados-chave</p>
        </div>

        {/* Dashboard / Charts tabs */}
        <div className="flex gap-1 mb-6 bg-okr-bl rounded-lg p-0.5 w-fit">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-okr-su text-okr-dk shadow-sm' : 'text-okr-mi hover:text-okr-dk'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'charts' ? 'bg-okr-su text-okr-dk shadow-sm' : 'text-okr-mi hover:text-okr-dk'
            }`}
          >
            Gráficos
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              <MetricCard label="OBJETIVOS" value="2" sub="Confiabilidade · Experiência" hint="Ver objetivos" onClick={() => setShowObjetivos(true)} />
              <MetricCard label="RESULTADOS-CHAVE" value="4" sub="Horas · Retificações · CES · NPS" hint="Ver resultados-chave" onClick={() => setShowKrList(true)} />
              <MetricCard label="AÇÕES TOTAIS" value={String(overall.actionCount)} sub={`${overall.actionDone} concluídas`} hint="Ver todas as ações" onClick={() => setShowAllActions(true)} />
              <div className="bg-okr-dk rounded-xl p-[18px_20px] shadow-[0_2px_8px_rgba(13,38,1,0.08),0_6px_20px_rgba(13,38,1,0.06)] hover:shadow-[0_4px_16px_rgba(13,38,1,0.12),0_8px_32px_rgba(13,38,1,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                <div className="text-[11px] font-medium text-[#5fa867] uppercase tracking-wider mb-1.5">PROGRESSO GERAL</div>
                <div className="text-[28px] font-semibold text-[#a8e89c] leading-none">{overall.percent}%</div>
                <div className="text-xs text-[#6b9b73] mt-1">{overall.actionDone} de {overall.actionCount} ações concluídas</div>
              </div>
            </div>

            {/* Deadline Alerts */}
            <DeadlineAlerts onOpenArea={setActiveArea} />

            {/* KR Progress */}
            <SectionLabel>Progresso por resultado-chave</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-8">
              {KRS.map(kr => {
                const p = calcProgressByKr(kr.key, actionStates, chipStates);
                return (
                  <button
                    key={kr.key}
                    onClick={() => setActiveKr(kr.key)}
                    className="bg-okr-su rounded-xl p-5 shadow-[0_2px_8px_rgba(13,38,1,0.08),0_6px_20px_rgba(13,38,1,0.06)] text-left hover:shadow-[0_4px_16px_rgba(13,38,1,0.12),0_8px_32px_rgba(13,38,1,0.08)] hover:-translate-y-0.5 hover:border-okr-bo border border-transparent transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-okr-dk text-[#a8e89c] text-[10px] font-medium px-2.5 py-0.5 rounded-full">{kr.name}</span>
                      <span className="text-[22px] text-okr-dk">{p.percent}%</span>
                    </div>
                    <p className="text-[13px] font-medium text-okr-dk mb-1">{kr.fullName}</p>
                    <p className="text-[11px] text-okr-mi mb-2">Objetivo {kr.objetivo} · Meta: {kr.meta}</p>
                    <ProgressBar percent={p.percent} fillColor="#005216" height={8} />
                    <p className="text-[11px] text-okr-lt mt-2">{p.actionDone} de {p.actionCount} ações concluídas</p>
                  </button>
                );
              })}
            </div>

            {/* Area Progress */}
            <SectionLabel>Visão por área</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {AREAS.filter(a => a.key !== 'todos').map(area => {
                const p = calcProgressByArea(area.key, actionStates, chipStates);
                return (
                  <button
                    key={area.key}
                    onClick={() => setActiveArea(area.key)}
                    className="bg-okr-su rounded-xl p-4 shadow-[0_2px_8px_rgba(13,38,1,0.08),0_6px_20px_rgba(13,38,1,0.06)] text-left hover:shadow-[0_4px_16px_rgba(13,38,1,0.12),0_8px_32px_rgba(13,38,1,0.08)] hover:-translate-y-0.5 hover:border-okr-bo border border-transparent transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: area.color }} />
                      <span className="text-sm font-medium text-okr-dk">{area.name}</span>
                    </div>
                    <div className="text-lg font-semibold text-okr-dk mb-1">{p.percent}%</div>
                    <p className="text-[11px] text-okr-lt mb-2">{p.actionDone} de {p.actionCount} ações concluídas</p>
                    <ProgressBar percent={p.percent} fillColor={area.color} height={5} />
                  </button>
                );
              })}
            </div>

            {/* Cronograma */}
            <SectionLabel>Cronograma trimestral</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              {[
                { name: 'Abril', bg: '#0D2601', items: CRONOGRAMA.abril },
                { name: 'Maio', bg: '#005216', items: CRONOGRAMA.maio },
                { name: 'Junho', bg: '#36523D', items: CRONOGRAMA.junho },
              ].map(month => (
                <div key={month.name} className="rounded-xl p-5 shadow-[0_2px_8px_rgba(13,38,1,0.08),0_6px_20px_rgba(13,38,1,0.06)] hover:shadow-[0_4px_16px_rgba(13,38,1,0.12),0_8px_32px_rgba(13,38,1,0.08)] hover:-translate-y-0.5 transition-all duration-300" style={{ backgroundColor: month.bg }}>
                  <h3 className="text-[13px] font-semibold text-[#a8e89c] mb-3">{month.name}</h3>
                  <ul className="space-y-1.5">
                    {month.items.map((item, i) => (
                      <li key={i} className="text-[12px] text-[#c0e8b8] flex items-start gap-2">
                        <span className="text-okr-br mt-0.5">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'charts' && (
          <OkrCharts />
        )}

        {/* Footer */}
        <div className="border-t border-okr-bl pt-4 text-center text-xs text-okr-lt">
          OKRs — Time Igrejas · {quarter.label} · {quarter.period.split(' · ')[0]}
        </div>
      </div>

      {/* Modals */}
      {activeArea && <AreaModal area={activeArea} open={!!activeArea} onClose={() => setActiveArea(null)} />}
      <ObjetivosModal open={showObjetivos} onClose={() => setShowObjetivos(false)} />
      <KrListModal open={showKrList} onClose={() => setShowKrList(false)} />
      <KrDetailModal krKey={activeKr} open={!!activeKr} onClose={() => setActiveKr(null)} />
      <AllActionsModal open={showAllActions} onClose={() => setShowAllActions(false)} />
      <ActivityLogSidebar open={showLog} onClose={() => setShowLog(false)} />
      {showCreateAction && <ActionFormModal open={showCreateAction} onClose={() => setShowCreateAction(false)} />}
      {showSpreadsheets && (
        <SpreadsheetImportModal
          open={showSpreadsheets}
          onClose={() => setShowSpreadsheets(false)}
          imports={spreadsheetImports}
          onRefresh={refreshSpreadsheets}
        />
      )}
    </div>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: string;
  sub: string;
  hint: string;
  onClick: () => void;
}> = ({ label, value, sub, hint, onClick }) => (
  <button
    onClick={onClick}
    className="bg-okr-su rounded-xl p-[18px_20px] shadow-[0_2px_8px_rgba(13,38,1,0.08),0_6px_20px_rgba(13,38,1,0.06)] text-left hover:shadow-[0_4px_16px_rgba(13,38,1,0.12),0_8px_32px_rgba(13,38,1,0.08)] hover:-translate-y-0.5 hover:border-okr-bo border border-transparent transition-all duration-300 cursor-pointer"
  >
    <div className="text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-1.5">{label}</div>
    <div className="text-[28px] font-semibold text-okr-dk leading-none">{value}</div>
    <div className="text-xs text-okr-mi mt-1">{sub}</div>
    <div className="text-[10px] text-okr-lt mt-1.5 flex items-center gap-1">
      {hint}
    </div>
  </button>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-3.5 pb-2 border-b border-okr-bl">
    {children}
  </div>
);

export default Dashboard;
