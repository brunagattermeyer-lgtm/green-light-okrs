import React from 'react';
import { OBJETIVOS } from '@/data/okrData';
import Modal from './Modal';

const ObjetivosModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} title="Objetivos" maxWidth="600px">
    <div className="space-y-4">
      {OBJETIVOS.map(obj => (
        <div key={obj.num} className="border border-okr-bl rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-okr-dk text-[#a8e89c] text-[10px] font-medium px-2 py-0.5 rounded-full">
              Objetivo {obj.num}
            </span>
          </div>
          <p className="text-sm font-semibold text-okr-dk mb-4">{obj.name}</p>
          <div className="text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-2">KRs vinculados</div>
          <div className="flex flex-wrap gap-1.5">
            {obj.krLabels.map(label => (
              <span key={label} className="bg-okr-bl text-okr-dk text-[11px] px-2 py-0.5 rounded">{label}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Modal>
);

export default ObjetivosModal;
