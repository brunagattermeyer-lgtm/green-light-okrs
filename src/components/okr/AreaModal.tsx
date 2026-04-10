import React from 'react';
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

  const krGroups: Record<string, typeof actions> = {};
  actions.forEach(a => {
    if (!krGroups[a.kr]) krGroups[a.kr] = [];
    krGroups[a.kr].push(a);
  });

  const krLabels: Record<string, string> = {
    horas: 'REDUZIR EM 10% O TOTAL DE HORAS DEDICADAS EM ROTINAS',
    retificacoes: '% RETIFICAÇÕES ≤ 1%',
    ces: 'MANTER O CES DO TRIMESTRE EM 4,0 PONTOS',
    nps: 'NPS >= 75',
  };

  return (
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
            <div className="text-[10px] text-okr-lt uppercase tracking-wider">Ações</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-okr-dk">{progress.actionDone}</div>
            <div className="text-[10px] text-okr-lt uppercase tracking-wider">Concluídas</div>
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
