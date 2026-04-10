import { ACTIONS, OkrAction, AreaKey, KrKey } from '@/data/okrData';

export interface ActionStates {
  [actionId: string]: boolean;
}

export interface ChipStates {
  [chipKey: string]: boolean;
}

export function getMainActions(): OkrAction[] {
  return ACTIONS.filter(a => !a.sub);
}

export function getActionUnit(action: OkrAction, chipStates: ChipStates): { total: number; done: number } {
  if (action.sub) {
    return { total: 0.5, done: 0 }; // done handled separately
  }
  if (action.recurrent && action.chips) {
    const doneChips = action.chips.filter((_, i) => chipStates[`${action.id}_${i}`]).length;
    return { total: 1, done: doneChips / action.chips.length };
  }
  return { total: 1, done: 0 }; // done handled by actionStates
}

export function calcProgress(
  actions: OkrAction[],
  actionStates: ActionStates,
  chipStates: ChipStates
): { total: number; done: number; percent: number } {
  let total = 0;
  let done = 0;

  for (const action of actions) {
    if (action.sub) {
      total += 0.5;
      if (actionStates[action.id]) done += 0.5;
    } else if (action.recurrent && action.chips) {
      total += 1;
      const doneChips = action.chips.filter((_, i) => chipStates[`${action.id}_${i}`]).length;
      done += doneChips / action.chips.length;
    } else {
      total += 1;
      if (actionStates[action.id]) done += 1;
    }
  }

  return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export function calcProgressByKr(kr: KrKey, actionStates: ActionStates, chipStates: ChipStates) {
  const actions = ACTIONS.filter(a => a.kr === kr);
  return calcProgress(actions, actionStates, chipStates);
}

export function calcProgressByArea(area: AreaKey, actionStates: ActionStates, chipStates: ChipStates) {
  const actions = ACTIONS.filter(a => a.area === area);
  return calcProgress(actions, actionStates, chipStates);
}

export function calcOverallProgress(actionStates: ActionStates, chipStates: ChipStates) {
  return calcProgress(ACTIONS, actionStates, chipStates);
}

export function countMainActionsByArea(area: AreaKey): number {
  return ACTIONS.filter(a => a.area === area && !a.sub).length;
}

export function countDoneMainActionsByArea(area: AreaKey, actionStates: ActionStates, chipStates: ChipStates): number {
  let done = 0;
  const actions = ACTIONS.filter(a => a.area === area && !a.sub);
  for (const a of actions) {
    if (a.recurrent && a.chips) {
      const doneChips = a.chips.filter((_, i) => chipStates[`${a.id}_${i}`]).length;
      if (doneChips === a.chips.length) done++;
    } else if (actionStates[a.id]) {
      done++;
    }
  }
  return done;
}
