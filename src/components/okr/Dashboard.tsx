import React, { useState } from 'react';
import { ACTIONS, AREAS, KRS, OBJETIVOS, GLOSSARIO, CRONOGRAMA, KrKey, AreaKey } from '@/data/okrData';
import { useOkrState } from '@/contexts/OkrStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { calcOverallProgress, calcProgressByKr, calcProgressByArea } from '@/lib/progressCalc';
import ProgressBar from '@/components/okr/ProgressBar';
import AreaModal from '@/components/okr/AreaModal';
import ObjetivosModal from '@/components/okr/ObjetivosModal';
import KrListModal from '@/components/okr/KrListModal';
import KrDetailModal from '@/components/okr/KrDetailModal';
import AllActionsModal from '@/components/okr/AllActionsModal';
import OkrCharts from '@/components/okr/OkrCharts';
import DeadlineAlerts from '@/components/okr/DeadlineAlerts';
import ActivityLogSidebar from '@/components/okr/ActivityLogSidebar';
import logoAtlc from '@/assets/logo-atlc.png';

const Dashboard: React.FC = () => {
  const { actionStates, chipStates, loading } = useOkrState();
  const { user, signOut } = useAuth();
  const [activeArea, setActiveArea] = useState<AreaKey | null>(null);
  const [showObjetivos, setShowObjetivos] = useState(false);
  const [showKrList, setShowKrList] = useState(false);
  const [showAllActions, setShowAllActions] = useState(false);
  const [activeKr, setActiveKr] = useState<KrKey | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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

  return (
    <div className="min-h-screen bg-okr-bg">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-20">
        {/* User bar */}
        <div className="flex items-center justify-end gap-3 mb-6 text-xs text-okr-lt">
          <span>{user?.email}</span>
          <button onClick={signOut} className="px-3 py-1 rounded bg-okr-bl hover:bg-okr-bo transition-colors text-okr-mi">
            Sair
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="px-2 py-1 rounded bg-okr-bl hover:bg-okr-bo transition-colors text-okr-mi text-sm font-bold"
            >
              ⋯
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-okr-su border border-okr-bl rounded-lg shadow-modal z-40 min-w-[160px]">
                  <button
                    onClick={() => { setShowLog(true); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-okr-dk hover:bg-okr-bl transition-colors rounded-lg"
                  >
                    Mostrar log
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <img src={logoAtlc} alt="ATLC Igrejas" className="h-10" />
            <span className="bg-okr-dk text-[#a8d8a8] text-[11px] font-medium tracking-wider px-3 py-1 rounded-full">
              2T 2026
            </span>
          </div>
          <h1 className="text-[26px] font-semibold text-okr-dk tracking-tight">OKRs — Gestão Operacional</h1>
          <p className="text-sm text-okr-mi mt-1">Abril — Junho 2026 · 2 objetivos · 4 resultados-chave</p>
        </div>

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
        <SectionLabel>Progresso por resultado-chave — clique para ver as ações vinculadas</SectionLabel>
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
                <p className="text-[10px] text-okr-fo mt-1 flex items-center gap-1">→ Ver ações vinculadas</p>
              </button>
            );
          })}
        </div>

        {/* Area Progress */}
        <SectionLabel>Visão por área — clique para ver e editar as ações</SectionLabel>
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
                <p className="text-[10px] text-okr-fo mt-2">Ver ações →</p>
              </button>
            );
          })}
        </div>

        {/* Charts */}
        <OkrCharts />

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

        {/* Glossário */}
        <SectionLabel>Glossário</SectionLabel>
        <div className="bg-okr-su rounded-xl shadow-[0_2px_8px_rgba(13,38,1,0.08),0_6px_20px_rgba(13,38,1,0.06)] overflow-hidden mb-8 border border-transparent">
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

        {/* Footer */}
        <div className="border-t border-okr-bl pt-4 text-center text-xs text-okr-lt">
          OKRs — Time Igrejas · 2T 2026 · Abril–Junho
        </div>
      </div>

      {/* Modals */}
      {activeArea && <AreaModal area={activeArea} open={!!activeArea} onClose={() => setActiveArea(null)} />}
      <ObjetivosModal open={showObjetivos} onClose={() => setShowObjetivos(false)} />
      <KrListModal open={showKrList} onClose={() => setShowKrList(false)} />
      <KrDetailModal krKey={activeKr} open={!!activeKr} onClose={() => setActiveKr(null)} />
      <AllActionsModal open={showAllActions} onClose={() => setShowAllActions(false)} />
      <ActivityLogSidebar open={showLog} onClose={() => setShowLog(false)} />
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
      → {hint}
    </div>
  </button>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-3.5 pb-2 border-b border-okr-bl">
    {children}
  </div>
);

export default Dashboard;
