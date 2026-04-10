import React, { useState } from 'react';
import { ACTIONS, AREAS, KRS } from '@/data/okrData';
import { useOkrState } from '@/contexts/OkrStateContext';
import Modal from './Modal';
import ActionItem from './ActionItem';

const AllActionsModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { actionStates, chipStates } = useOkrState();
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');

  const mainActions = ACTIONS.filter(a => !a.sub);
  const filtered = mainActions.filter(a => {
    const isDone = a.recurrent
      ? (a.chips?.every((_, i) => chipStates[`${a.id}_${i}`]) ?? false)
      : !!actionStates[a.id];
    if (filter === 'pending') return !isDone;
    if (filter === 'done') return isDone;
    return true;
  });

  // Sort by prazo
  const prazoOrder: Record<string, number> = { 'Abr/2026': 1, 'Mai/2026': 2, 'Mai–Jun/2026': 3, 'Jun/2026': 4, 'Semanal': 5 };
  const sorted = [...filtered].sort((a, b) => (prazoOrder[a.prazo] || 99) - (prazoOrder[b.prazo] || 99));

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendentes' },
    { key: 'done', label: 'Concluídas' },
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
                ? 'bg-okr-dk text-[#a8e89c]'
                : 'bg-okr-bl text-okr-mi hover:bg-okr-bo'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="space-y-1">
        {sorted.map(action => (
          <ActionItem key={action.id} action={action} showArea showKr />
        ))}
      </div>
      {sorted.length === 0 && (
        <p className="text-center text-okr-lt text-sm py-8">Nenhuma ação encontrada.</p>
      )}
    </Modal>
  );
};

export default AllActionsModal;
