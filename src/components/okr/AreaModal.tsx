import React, { useState, useEffect } from 'react';
import { ACTIONS, AREAS, AreaKey } from '@/data/okrData';
import { useOkrState } from '@/contexts/OkrStateContext';
import { calcProgressByArea } from '@/lib/progressCalc';
import { getDeadlineAlerts } from '@/lib/deadlineUtils';
import Modal from './Modal';
import ProgressBar from './ProgressBar';
import ActionItem from './ActionItem';
import ActionFormModal from './ActionFormModal';
import { supabase } from '@/integrations/supabase/client';

interface AreaModalProps {
  area: AreaKey;
  open: boolean;
  onClose: () => void;
}

const AreaModal: React.FC<AreaModalProps> = ({ area, open, onClose }) => {
  const { actionStates, chipStates } = useOkrState();
  const areaInfo = AREAS.find(a => a.key === area)!;
  const actions = ACTIONS.filter(a => a.area === area);
  const progress = calcProgressByArea(area, actionStates, chipStates);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done' | 'overdue'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [customActions, setCustomActions] = useState<any[]>([]);

  const alerts = getDeadlineAlerts(actionStates, chipStates);
  const overdueIds = new Set(alerts.filter(a => a.type === 'overdue').map(a => a.action.id));

  // Fetch custom actions for this area
  useEffect(() => {
    if (!open) return;
    supabase.from('custom_actions').select('*').eq('area', area).then(({ data }) => {
      setCustomActions(data || []);
    });
  }, [open, area]);

  const filtered = actions.filter(a => {
    const isDone = a.recurrent
      ? (a.chips?.every((_, i) => chipStates[`${a.id}_${i}`]) ?? false)
      : !!actionStates[a.id];
    if (filter === 'pending') return !isDone && !a.sub;
    if (filter === 'done') return isDone && !a.sub;
    if (filter === 'overdue') return overdueIds.has(a.id) && !a.sub;
    return true;
  });

  const krGroups: Record<string, typeof filtered> = {};
  filtered.forEach(a => {
    if (!krGroups[a.kr]) krGroups[a.kr] = [];
    krGroups[a.kr].push(a);
  });

  const krLabels: Record<string, string> = {
    horas: 'REDUZIR EM 10% O TOTAL DE HORAS DEDICADAS EM ROTINAS',
    retificacoes: '% RETIFICACOES <= 1%',
    ces: 'MANTER O CES DO TRIMESTRE EM 4,0 PONTOS',
    nps: 'NPS >= 75',
  };

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendentes' },
    { key: 'done', label: 'Concluidas' },
    { key: 'overdue', label: 'Em atraso' },
  ];

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={areaInfo.name}
        titleIcon={<span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: areaInfo.color }} />}
      >
        <div className="mb-5">
          <div className="flex items-center gap-6 mb-3">
            <div className="text-center">
              <div className="text-2xl font-semibold text-okr-dk">{progress.actionCount}</div>
              <div className="text-[10px] text-okr-lt uppercase tracking-wider">Acoes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-okr-dk">{progress.actionDone}</div>
              <div className="text-[10px] text-okr-lt uppercase tracking-wider">Concluidas</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-okr-mi">Progresso</span>
                <span className="text-sm font-medium text-okr-dk">{progress.percent}%</span>
              </div>
              <ProgressBar percent={progress.percent} fillColor="#005216" height={8} />
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === f.key
                    ? f.key === 'overdue' ? 'bg-red-600 text-white' : 'bg-okr-dk text-[#a8e89c]'
                    : 'bg-okr-bl text-okr-mi hover:bg-okr-bo'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-1 rounded-full text-xs font-medium bg-okr-fo text-white hover:bg-okr-dk transition-colors"
          >
            + Nova acao
          </button>
        </div>

        {Object.entries(krGroups).map(([kr, krActions]) => (
          <div key={kr} className="mb-5">
            <div className="text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-3 pb-2 border-b border-okr-bl">
              {krLabels[kr] || kr}
            </div>
            <div className="space-y-1">
              {krActions.map(action => (
                <ActionItem key={action.id} action={action} editable areaColor={areaInfo.color} />
              ))}
            </div>
          </div>
        ))}

        {/* Custom actions */}
        {customActions.length > 0 && (
          <div className="mb-5">
            <div className="text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-3 pb-2 border-b border-okr-bl">
              Acoes adicionadas
            </div>
            <div className="space-y-1">
              {customActions.map(ca => (
                <div key={ca.id} className="flex items-center justify-between p-3 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-okr-dk">{ca.action_text}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#e8f5e8] text-[#27500a]">
                        {ca.responsaveis?.join(', ')}
                      </span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#e8f0f8] text-[#0c447c]">
                        {ca.prazo}
                      </span>
                      {ca.is_action_plan && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                          Plano de acao
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && customActions.length === 0 && (
          <p className="text-center text-okr-lt text-sm py-6">Nenhuma acao encontrada.</p>
        )}
      </Modal>

      {showCreateForm && (
        <ActionFormModal
          open={showCreateForm}
          onClose={() => {
            setShowCreateForm(false);
            // Refresh custom actions
            supabase.from('custom_actions').select('*').eq('area', area).then(({ data }) => {
              setCustomActions(data || []);
            });
          }}
          editData={null}
        />
      )}
    </>
  );
};

export default AreaModal;
