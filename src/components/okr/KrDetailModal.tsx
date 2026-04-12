import React from 'react';
import { KRS, ACTIONS, AREAS, KrKey } from '@/data/okrData';
import { useOkrState } from '@/contexts/OkrStateContext';
import { calcProgressByKr } from '@/lib/progressCalc';
import Modal from './Modal';
import ProgressBar from './ProgressBar';

interface KrDetailModalProps {
  krKey: KrKey | null;
  open: boolean;
  onClose: () => void;
}

const KrDetailModal: React.FC<KrDetailModalProps> = ({ krKey, open, onClose }) => {
  const { actionStates, chipStates } = useOkrState();
  if (!krKey) return null;
  
  const kr = KRS.find(k => k.key === krKey)!;
  const p = calcProgressByKr(krKey, actionStates, chipStates);
  const actions = ACTIONS.filter(a => a.kr === krKey);

  const areaGroups: Record<string, typeof actions> = {};
  actions.forEach(a => {
    if (!areaGroups[a.area]) areaGroups[a.area] = [];
    areaGroups[a.area].push(a);
  });

  return (
    <Modal open={open} onClose={onClose} title={kr.fullName}>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl text-okr-dk">{p.percent}%</span>
          <span className="text-sm text-okr-mi">{p.actionDone} de {p.actionCount} acoes concluidas</span>
        </div>
        <ProgressBar percent={p.percent} fillColor={kr.fillColor} />
        <p className="text-[11px] text-okr-lt mt-2">Objetivo {kr.objetivo} · Meta: {kr.meta}</p>
      </div>

      {Object.entries(areaGroups).map(([areaKey, areaActions]) => {
        const area = AREAS.find(a => a.key === areaKey)!;
        return (
          <div key={areaKey} className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: area.color }} />
              <span className="text-[11px] font-medium text-okr-lt uppercase tracking-wider">{area.name}</span>
            </div>
            {areaActions.map(action => {
              const isDone = action.recurrent
                ? (action.chips?.every((_, i) => chipStates[`${action.id}_${i}`]) ?? false)
                : !!actionStates[action.id];
              return (
                <div key={action.id} className={`flex items-center justify-between py-2 px-3 ${action.sub ? 'ml-5' : ''} ${isDone ? 'opacity-60' : ''}`}>
                  <span className={`text-[13px] text-okr-dk flex-1 ${isDone ? 'line-through' : ''}`}>
                    {action.sub && '↳ '}{action.text}
                  </span>
                  <span className="text-[10px] text-okr-lt ml-2 flex-shrink-0">{action.prazo}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </Modal>
  );
};

export default KrDetailModal;
