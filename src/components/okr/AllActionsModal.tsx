import React, { useState } from 'react';
import { ACTIONS, AREAS, KRS } from '@/data/okrData';
import { useOkrState } from '@/contexts/OkrStateContext';
import { getDeadlineAlerts } from '@/lib/deadlineUtils';
import Modal from './Modal';

const AllActionsModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { actionStates, chipStates } = useOkrState();
  const [filter, setFilter] = useState<'all' | 'pending' | 'done' | 'overdue'>('all');

  const alerts = getDeadlineAlerts(actionStates, chipStates);
  const overdueIds = new Set(alerts.filter(a => a.type === 'overdue').map(a => a.action.id));

  const mainActions = ACTIONS.filter(a => !a.sub);
  const filtered = mainActions.filter(a => {
    const isDone = a.recurrent
      ? (a.chips?.every((_, i) => chipStates[`${a.id}_${i}`]) ?? false)
      : !!actionStates[a.id];
    if (filter === 'pending') return !isDone;
    if (filter === 'done') return isDone;
    if (filter === 'overdue') return overdueIds.has(a.id);
    return true;
  });

  const prazoOrder: Record<string, number> = { 'Abr/2026': 1, 'Mai/2026': 2, 'Mai–Jun/2026': 3, 'Jun/2026': 4, 'Semanal': 5 };
  const sorted = [...filtered].sort((a, b) => (prazoOrder[a.prazo] || 99) - (prazoOrder[b.prazo] || 99));

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendentes' },
    { key: 'done', label: 'Concluídas' },
    { key: 'overdue', label: 'Em atraso' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Todas as ações">
      <div className="flex gap-2 mb-4">
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
            {f.key === 'overdue' && overdueIds.size > 0 && ` (${overdueIds.size})`}
          </button>
        ))}
      </div>
      <div className="space-y-1">
        {sorted.map(action => {
          const isDone = action.recurrent
            ? (action.chips?.every((_, i) => chipStates[`${action.id}_${i}`]) ?? false)
            : !!actionStates[action.id];
          const isOverdue = overdueIds.has(action.id);
          return (
            <div
              key={action.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                isOverdue && !isDone ? 'bg-red-50' : ''
              }`}
            >
              <span className={`text-[13px] flex-1 min-w-0 mr-3 ${isDone ? 'text-okr-lt underline' : 'text-okr-dk'}`}>
                {action.text}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  isOverdue && !isDone ? 'bg-red-100 text-red-700' : 'bg-[#e8f0f8] text-[#0c447c]'
                }`}>
                  {action.prazo}
                </span>
                {isDone && (
                  <span className="w-4 h-4 rounded-full bg-okr-fo flex items-center justify-center flex-shrink-0">
                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {sorted.length === 0 && (
        <p className="text-center text-okr-lt text-sm py-8">Nenhuma ação encontrada.</p>
      )}
    </Modal>
  );
};

export default AllActionsModal;
