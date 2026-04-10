import React, { useState } from 'react';
import { ACTIONS, AREAS, AreaKey } from '@/data/okrData';
import { useOkrState } from '@/contexts/OkrStateContext';
import { calcProgressByArea } from '@/lib/progressCalc';
import Modal from './Modal';
import ProgressBar from './ProgressBar';
import ActionItem from './ActionItem';

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

  // Group by KR
  const krGroups: Record<string, typeof actions> = {};
  actions.forEach(a => {
    if (!krGroups[a.kr]) krGroups[a.kr] = [];
    krGroups[a.kr].push(a);
  });

  const krLabels: Record<string, string> = {
    horas: 'Horas em rotinas',
    retificacoes: 'Retificações ≤ 1%',
    ces: 'CES ≥ 4,0',
    nps: 'NPS ≥ 75',
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={areaInfo.name}
      titleIcon={<span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: areaInfo.color }} />}
    >
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-2xl font-medium text-okr-dk">{progress.percent}%</span>
          <span className="text-sm text-okr-mi">{progress.done.toFixed(1)} de {progress.total.toFixed(1)} unidades concluídas</span>
        </div>
        <ProgressBar percent={progress.percent} fillColor={areaInfo.color} />
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
    </Modal>
  );
};

export default AreaModal;
