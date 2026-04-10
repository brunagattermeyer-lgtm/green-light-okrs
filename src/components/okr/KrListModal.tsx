import React from 'react';
import { KRS, ACTIONS, AREAS, KrKey } from '@/data/okrData';
import { useOkrState } from '@/contexts/OkrStateContext';
import { calcProgressByKr } from '@/lib/progressCalc';
import Modal from './Modal';
import ProgressBar from './ProgressBar';

const KrListModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { actionStates, chipStates } = useOkrState();

  return (
    <Modal open={open} onClose={onClose} title="Resultados-chave">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {KRS.map(kr => {
          const p = calcProgressByKr(kr.key, actionStates, chipStates);
          const krActions = ACTIONS.filter(a => a.kr === kr.key && !a.sub);
          const areas = [...new Set(krActions.map(a => a.area))];
          return (
            <div key={kr.key} className="border border-okr-bl rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-okr-dk text-[#a8e89c] text-[10px] font-medium px-2 py-0.5 rounded-full">{kr.name}</span>
                <span className="font-mono text-lg text-okr-dk">{p.percent}%</span>
              </div>
              <p className="text-[13px] text-okr-dk font-medium mb-1">{kr.fullName}</p>
              <p className="text-[11px] text-okr-mi mb-2">Meta: {kr.meta}</p>
              <ProgressBar percent={p.percent} fillColor={kr.fillColor} />
              <p className="text-[11px] text-okr-lt mt-2">{p.done.toFixed(1)} de {p.total.toFixed(1)} unidades</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {areas.map(aKey => {
                  const a = AREAS.find(x => x.key === aKey)!;
                  return (
                    <span key={aKey} className="inline-flex items-center gap-1 text-[10px] text-okr-mi">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.color }} />
                      {a.name}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default KrListModal;
