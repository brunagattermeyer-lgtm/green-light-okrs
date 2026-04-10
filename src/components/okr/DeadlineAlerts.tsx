import React from 'react';
import { useOkrState } from '@/contexts/OkrStateContext';
import { getDeadlineAlerts } from '@/lib/deadlineUtils';
import { AREAS, AreaKey } from '@/data/okrData';

interface DeadlineAlertsProps {
  onOpenArea: (area: AreaKey) => void;
}

const DeadlineAlerts: React.FC<DeadlineAlertsProps> = ({ onOpenArea }) => {
  const { actionStates, chipStates } = useOkrState();
  const alerts = getDeadlineAlerts(actionStates, chipStates);

  if (alerts.length === 0) return null;

  const overdue = alerts.filter(a => a.type === 'overdue');
  const upcoming = alerts.filter(a => a.type === 'upcoming');

  return (
    <div className="mb-8">
      <div className="text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-3.5 pb-2 border-b border-okr-bl">
        Alertas de prazo
      </div>
      <div className="space-y-2">
        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.5"/><path d="M8 4.5V8.5M8 10.5V11" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span className="text-xs font-semibold text-red-700">Vencidas ({overdue.length})</span>
            </div>
            <div className="space-y-1.5">
              {overdue.map(alert => {
                const area = AREAS.find(a => a.key === alert.action.area);
                return (
                  <button
                    key={alert.action.id}
                    onClick={() => onOpenArea(alert.action.area)}
                    className="w-full text-left flex items-start gap-2 p-2 rounded hover:bg-red-100 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-red-800 font-medium truncate">{alert.action.text}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-red-600">{alert.action.prazo}</span>
                        {area && <span className="text-[10px] text-red-500">· {area.name}</span>}
                        {alert.detail && <span className="text-[10px] text-red-500">· {alert.detail}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#d97706" strokeWidth="1.5"/><path d="M8 4.5V8.5M8 10.5V11" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span className="text-xs font-semibold text-amber-700">Próximas do prazo ({upcoming.length})</span>
            </div>
            <div className="space-y-1.5">
              {upcoming.map(alert => {
                const area = AREAS.find(a => a.key === alert.action.area);
                return (
                  <button
                    key={alert.action.id}
                    onClick={() => onOpenArea(alert.action.area)}
                    className="w-full text-left flex items-start gap-2 p-2 rounded hover:bg-amber-100 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-amber-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-amber-800 font-medium truncate">{alert.action.text}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-amber-600">{alert.action.prazo}</span>
                        {area && <span className="text-[10px] text-amber-500">· {area.name}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeadlineAlerts;
