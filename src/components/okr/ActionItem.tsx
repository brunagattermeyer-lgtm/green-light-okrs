import React, { useState } from 'react';
import { OkrAction, AREAS, KRS } from '@/data/okrData';
import { useOkrState } from '@/contexts/OkrStateContext';

interface ActionItemProps {
  action: OkrAction;
  editable?: boolean;
  areaColor?: string;
  showArea?: boolean;
  showKr?: boolean;
}

const ActionItem: React.FC<ActionItemProps> = ({ action, editable = false, areaColor, showArea = false, showKr = true }) => {
  const { actionStates, chipStates, toggleAction, toggleChip } = useOkrState();
  const [showTooltip, setShowTooltip] = useState(false);
  const isDone = action.recurrent
    ? (action.chips?.every((_, i) => chipStates[`${action.id}_${i}`]) ?? false)
    : !!actionStates[action.id];

  const checkboxColor = action.sub ? '#36523D' : '#005216';
  const area = AREAS.find(a => a.key === action.area);
  const kr = KRS.find(k => k.key === action.kr);

  return (
    <div className={`flex flex-col gap-1.5 p-3 rounded-lg transition-colors ${action.sub ? 'ml-5 bg-[#fafcfa] border-l-[3px] border-okr-bo' : ''}`}>
      <div className="flex items-start gap-3">
        {editable && !action.recurrent && (
          <button
            onClick={() => toggleAction(action.id)}
            className="mt-0.5 w-[17px] h-[17px] rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors"
            style={{
              borderColor: isDone ? checkboxColor : '#d0ddd0',
              backgroundColor: isDone ? checkboxColor : 'transparent',
            }}
          >
            {isDone && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}
        {editable && action.recurrent && (
          <div className="mt-0.5 w-[17px] h-[17px] rounded flex-shrink-0 border-2 border-okr-bo flex items-center justify-center bg-okr-bg">
            <span className="text-[8px] text-okr-lt">↻</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[13px] font-medium text-okr-dk ${isDone && !action.recurrent ? 'line-through opacity-60' : ''}`}>
              {action.text}
            </span>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="w-[15px] h-[15px] rounded-full bg-okr-bl hover:bg-okr-fo text-okr-lt hover:text-white text-[9px] font-medium flex items-center justify-center transition-colors flex-shrink-0"
              >
                i
              </button>
              {showTooltip && (
                <div className="absolute z-50 left-6 top-0 w-[280px] bg-okr-dk text-[#c8eebc] text-xs p-3 rounded-lg shadow-modal">
                  <p><strong>Responsável:</strong> {action.resp}</p>
                  <p><strong>Prazo:</strong> {action.prazo}</p>
                  <p><strong>Área:</strong> {area?.name}</p>
                  <p><strong>KR:</strong> {kr?.name}</p>
                  {action.sub && <p className="mt-1 text-[10px] opacity-75">Subtask — peso 0,5</p>}
                  {action.recurrent && <p className="mt-1 text-[10px] opacity-75">Ação recorrente — progresso por chips</p>}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[#e8f5e8] text-[#27500a]">{action.resp}</span>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[#e8f0f8] text-[#0c447c]">{action.prazo}</span>
            {showArea && area && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-okr-bl text-okr-dk">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: area.color }} />
                {area.name}
              </span>
            )}
            {showKr && kr && (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-okr-dk text-[#a8e89c]">{kr.name}</span>
            )}
          </div>
        </div>
      </div>

      {/* Recurrent chips */}
      {action.recurrent && action.chips && (
        <div className="mt-2 ml-8">
          <p className="text-[10px] text-okr-lt mb-1.5">{action.chipLabel}</p>
          <div className="flex flex-wrap gap-1.5">
            {action.chips.map((chip, i) => {
              const chipKey = `${action.id}_${i}`;
              const chipDone = !!chipStates[chipKey];
              return (
                <button
                  key={chipKey}
                  onClick={editable ? () => toggleChip(chipKey) : undefined}
                  disabled={!editable}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                    chipDone
                      ? 'bg-okr-fo text-white border-okr-fo'
                      : 'bg-okr-su text-okr-dk border-okr-bo hover:border-okr-fo'
                  } ${editable ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${chipDone ? 'bg-okr-br' : 'bg-okr-bo'}`} />
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionItem;
