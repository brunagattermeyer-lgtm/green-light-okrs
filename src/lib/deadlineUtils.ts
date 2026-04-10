import { OkrAction, ACTIONS } from '@/data/okrData';
import type { ActionStates, ChipStates } from './progressCalc';

const MONTH_MAP: Record<string, number> = {
  'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5,
  'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11,
};

function lastDayOfMonth(month: number, year: number): Date {
  return new Date(year, month + 1, 0, 23, 59, 59);
}

export function parsePrazo(prazo: string): Date | null {
  // "Abr/2026" → last day of April 2026
  const simple = prazo.match(/^(\w{3})\/(\d{4})$/);
  if (simple) {
    const m = MONTH_MAP[simple[1]];
    if (m !== undefined) return lastDayOfMonth(m, parseInt(simple[2]));
  }
  // "Mai–Jun/2026" → last day of June 2026
  const range = prazo.match(/^\w{3}[–-](\w{3})\/(\d{4})$/);
  if (range) {
    const m = MONTH_MAP[range[1]];
    if (m !== undefined) return lastDayOfMonth(m, parseInt(range[2]));
  }
  return null; // "Semanal" etc
}

export interface DeadlineAlert {
  action: OkrAction;
  type: 'overdue' | 'upcoming';
  deadline: Date | null;
  detail?: string;
}

export function getDeadlineAlerts(
  actionStates: ActionStates,
  chipStates: ChipStates,
  now: Date = new Date()
): DeadlineAlert[] {
  const alerts: DeadlineAlert[] = [];
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  for (const action of ACTIONS) {
    if (action.sub) continue;

    const isDone = action.recurrent && action.chips
      ? action.chips.every((_, i) => chipStates[`${action.id}_${i}`])
      : !!actionStates[action.id];

    if (isDone) continue;

    // Check recurrent chips for missed Thursdays
    if (action.recurrent && action.chips) {
      const missedChips: string[] = [];
      action.chips.forEach((chip, i) => {
        const chipKey = `${action.id}_${i}`;
        if (chipStates[chipKey]) return;
        // Parse chip date "dd/mm" → Date in 2026
        const parts = chip.split('/');
        if (parts.length === 2) {
          const chipDate = new Date(2026, parseInt(parts[1]) - 1, parseInt(parts[0]), 23, 59);
          if (chipDate < now) missedChips.push(chip);
        }
      });
      if (missedChips.length > 0) {
        alerts.push({
          action,
          type: 'overdue',
          deadline: null,
          detail: `${missedChips.length} data(s) sem marcação: ${missedChips.join(', ')}`,
        });
      }
      continue;
    }

    const deadline = parsePrazo(action.prazo);
    if (!deadline) continue;

    if (deadline < now) {
      alerts.push({ action, type: 'overdue', deadline });
    } else if (deadline <= sevenDays) {
      alerts.push({ action, type: 'upcoming', deadline });
    }
  }

  // Sort: overdue first, then by deadline
  alerts.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'overdue' ? -1 : 1;
    if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime();
    return 0;
  });

  return alerts;
}
