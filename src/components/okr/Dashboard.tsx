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

const Dashboard: React.FC = () => {
  const { actionStates, chipStates, loading } = useOkrState();
  const { user, signOut } = useAuth();
  const [activeArea, setActiveArea] = useState<AreaKey | null>(null);
  const [showObjetivos, setShowObjetivos] = useState(false);
  const [showKrList, setShowKrList] = useState(false);
  const [showAllActions, setShowAllActions] = useState(false);
  const [activeKr, setActiveKr] = useState<KrKey | null>(null);

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
  const mainActions = ACTIONS.filter(a => !a.sub);
  const doneMainActions = mainActions.filter(a => {
    if (a.recurrent && a.chips) {
      return a.chips.every((_, i) => chipStates[`${a.id}_${i}`]);
    }
    return !!actionStates[a.id];
  }).length;

  return (
    <div className="min-h-screen bg-okr-bg">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-20">
        {/* User bar */}
        <div className="flex items-center justify-end gap-3 mb-6 text-xs text-okr-lt">
          <span>{user?.email}</span>
          <button onClick={signOut} className="px-3 py-1 rounded bg-okr-bl hover:bg-okr-bo transition-colors text-okr-mi">
            Sair
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="bg-okr-dk text-[#a8d8a8] text-[11px] font-medium tracking-wider px-3 py-1 rounded-full">
              Time Igrejas · 2T 2026
            </span>
          </div>
          <h1 className="text-[26px] font-semibold text-okr-dk tracking-tight">OKRs — Gestão Operacional</h1>
          <p className="text-sm text-okr-mi mt-1">Abril — Junho 2026 · 2 objetivos · 4 resultados-chave</p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <MetricCard label="OBJETIVOS" value="2" sub="Confiabilidade · Experiência" hint="→ Ver objetivos" onClick={() => setShowObjetivos(true)} />
          <MetricCard label="RESULTADOS-CHAVE" value="4" sub="Horas · Retificações · CES · NPS" hint="→ Ver resultados-chave" onClick={() => setShowKrList(true)} />
          <MetricCard label="AÇÕES TOTAIS" value={String(mainActions.length)} sub={`${doneMainActions} concluídas`} hint="→ Ver todas as ações" onClick={() => setShowAllActions(true)} />
          <div className="bg-okr-dk rounded-lg p-[18px_20px] shadow-card">
            <div className="text-[11px] font-medium text-[#5fa867] uppercase tracking-wider mb-1.5">PROGRESSO GERAL</div>
            <div className="text-[28px] font-semibold text-[#a8e89c] leading-none font-mono">{overall.percent}%</div>
            <div className="text-xs text-[#6b9b73] mt-1">{overall.done.toFixed(1)} de {overall.total.toFixed(1)} unidades concluídas</div>
          </div>
        </div>

        {/* KR Progress */}
        <SectionLabel>Progresso por resultado-chave — clique para ver as ações vinculadas</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-8">
          {KRS.map(kr => {
            const p = calcProgressByKr(kr.key, actionStates, chipStates);
            const krActions = ACTIONS.filter(a => a.kr === kr.key && !a.sub);
            const doneKrActions = krActions.filter(a => {
              if (a.recurrent && a.chips) return a.chips.every((_, i) => chipStates[`${a.id}_${i}`]);
              return !!actionStates[a.id];
            }).length;
            return (
              <button
                key={kr.key}
                onClick={() => setActiveKr(kr.key)}
                className="bg-okr-su border border-okr-bl rounded-xl p-5 shadow-card text-left hover:border-okr-fo hover:-translate-y-px transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-okr-dk text-[#a8e89c] text-[10px] font-medium px-2.5 py-0.5 rounded-full">{kr.name}</span>
                  <span className="font-mono text-[22px] text-okr-dk">{p.percent}%</span>
                </div>
                <p className="text-[13px] font-medium text-okr-dk mb-1">{kr.fullName}</p>
                <p className="text-[11px] text-okr-mi mb-2">Objetivo {kr.objetivo} · Meta: {kr.meta}</p>
                <ProgressBar percent={p.percent} fillColor={kr.fillColor} height={8} />
                <p className="text-[11px] text-okr-lt mt-2">{doneKrActions} de {krActions.length} ações concluídas</p>
                <p className="text-[10px] text-okr-fo mt-1 flex items-center gap-1">→ Ver ações vinculadas</p>
              </button>
            );
          })}
        </div>

        {/* Area Progress */}
        <SectionLabel>Progresso por área — clique para gerenciar ações</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {AREAS.map(area => {
            const p = calcProgressByArea(area.key, actionStates, chipStates);
            const areaMainActions = ACTIONS.filter(a => a.area === area.key && !a.sub);
            const doneAreaActions = areaMainActions.filter(a => {
              if (a.recurrent && a.chips) return a.chips.every((_, i) => chipStates[`${a.id}_${i}`]);
              return !!actionStates[a.id];
            }).length;
            return (
              <button
                key={area.key}
                onClick={() => setActiveArea(area.key)}
                className="bg-okr-su border border-okr-bl rounded-lg p-4 shadow-card text-left hover:border-okr-fo hover:-translate-y-px transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: area.color }} />
                  <span className="text-sm font-medium text-okr-dk">{area.name}</span>
                </div>
                <div className="font-mono text-lg text-okr-dk mb-1">{p.percent}%</div>
                <p className="text-[11px] text-okr-lt mb-2">{doneAreaActions} de {areaMainActions.length} ações concluídas</p>
                <ProgressBar percent={p.percent} fillColor={area.color} height={5} />
                <p className="text-[10px] text-okr-fo mt-2">→ Gerenciar ações</p>
              </button>
            );
          })}
        </div>

        {/* Charts */}
        <SectionLabel>Gráficos</SectionLabel>
        <OkrCharts />

        {/* Cronograma */}
        <SectionLabel>Cronograma trimestral</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {[
            { name: 'Abril', bg: '#0D2601', items: CRONOGRAMA.abril },
            { name: 'Maio', bg: '#005216', items: CRONOGRAMA.maio },
            { name: 'Junho', bg: '#36523D', items: CRONOGRAMA.junho },
          ].map(month => (
            <div key={month.name} className="rounded-xl p-5" style={{ backgroundColor: month.bg }}>
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
        <div className="bg-okr-su border border-okr-bl rounded-lg shadow-card overflow-hidden mb-8">
          <table className="w-full">
            <tbody>
              {GLOSSARIO.map((g, i) => (
                <tr key={g.termo} className={i > 0 ? 'border-t border-okr-bl' : ''}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-okr-dk w-32 align-top">{g.termo}</td>
                  <td className="px-4 py-3 text-[13px] text-okr-mi">{g.def}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-okr-bl pt-4 text-center text-xs text-okr-lt">
          OKRs — Time Igrejas · 2T 2026 · Abril–Junho · atualizado via Supabase em tempo real
        </div>
      </div>

      {/* Modals */}
      {activeArea && <AreaModal area={activeArea} open={!!activeArea} onClose={() => setActiveArea(null)} />}
      <ObjetivosModal open={showObjetivos} onClose={() => setShowObjetivos(false)} />
      <KrListModal open={showKrList} onClose={() => setShowKrList(false)} />
      <KrDetailModal krKey={activeKr} open={!!activeKr} onClose={() => setActiveKr(null)} />
      <AllActionsModal open={showAllActions} onClose={() => setShowAllActions(false)} />
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
    className="bg-okr-su border border-okr-bl rounded-lg p-[18px_20px] shadow-card text-left hover:border-okr-fo hover:-translate-y-px transition-all cursor-pointer"
  >
    <div className="text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-1.5">{label}</div>
    <div className="text-[28px] font-semibold text-okr-dk leading-none">{value}</div>
    <div className="text-xs text-okr-mi mt-1">{sub}</div>
    <div className="text-[10px] text-okr-lt mt-1.5 flex items-center gap-1">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 1L7 5L3 9" stroke="currentColor" strokeWidth="1.5" /></svg>
      {hint.replace('→ ', '')}
    </div>
  </button>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-3.5 pb-2 border-b border-okr-bl">
    {children}
  </div>
);

export default Dashboard;
