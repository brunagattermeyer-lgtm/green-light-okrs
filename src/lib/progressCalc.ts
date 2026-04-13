import { ACTIONS, OkrAction, AreaKey, KrKey } from '@/data/okrData';

export interface ActionStates {
  [actionId: string]: boolean;
}

export interface ChipStates {
  [chipKey: string]: boolean;
}

/**
 * Count only main actions (not subtasks) for display "X de Y ações concluídas"
 */
export function countActions(actions: OkrAction[]): number {
  return actions.filter(a => !a.sub).length;
}

export function countDoneActions(actions: OkrAction[], actionStates: ActionStates, chipStates: ChipStates): number {
  let done = 0;
  for (const a of actions) {
    if (a.sub) continue;
    if (a.recurrent && a.chips) {
      const allDone = a.chips.every((_, i) => chipStates[`${a.id}_${i}`]);
      if (allDone) done++;
    } else if (actionStates[a.id]) {
      done++;
    }
  }
  return done;
}

/**
 * Calculate percentage progress including subtask and chip contributions.
 * - Main action (non-recurrent, no subs): 1 unit, done = 1 if checked
 * - Main action with subtasks: parent contributes 0, each sub contributes equal fraction of 1
 * - Recurrent action: 1 unit, done = doneChips/totalChips
 * - Subtask standalone (no parent detection needed): weight = 1/siblingCount of parent
 */
export function calcProgress(
  actions: OkrAction[],
  actionStates: ActionStates,
  chipStates: ChipStates
): { total: number; done: number; percent: number; actionCount: number; actionDone: number } {
  let total = 0;
  let done = 0;

  // Find parents that have subtasks
  const parentIds = new Set(actions.filter(a => a.sub && a.parentId).map(a => a.parentId!));
  
  for (const action of actions) {
    if (action.sub) {
      // Subtask: contributes to % but not to action count
      // Find how many siblings this parent has
      const siblings = actions.filter(a => a.sub && a.parentId === action.parentId);
      const weight = 1 / siblings.length;
      total += weight;
      if (actionStates[action.id]) done += weight;
    } else if (action.recurrent && action.chips) {
      total += 1;
      const doneChips = action.chips.filter((_, i) => chipStates[`${action.id}_${i}`]).length;
      done += doneChips / action.chips.length;
    } else if (parentIds.has(action.id)) {
      // Parent with subtasks: the parent itself doesn't add weight, subtasks do
      // Don't add to total — subtasks handle it
    } else {
      total += 1;
      if (actionStates[action.id]) done += 1;
    }
  }

  const actionCount = countActions(actions);
  const actionDone = countDoneActions(actions, actionStates, chipStates);

  return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0, actionCount, actionDone };
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
