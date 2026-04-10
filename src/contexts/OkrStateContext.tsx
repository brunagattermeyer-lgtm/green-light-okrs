import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ACTIONS } from '@/data/okrData';
import type { ActionStates, ChipStates } from '@/lib/progressCalc';

interface OkrStateContextType {
  actionStates: ActionStates;
  chipStates: ChipStates;
  loading: boolean;
  toggleAction: (actionId: string) => void;
  toggleChip: (chipKey: string) => void;
}

const OkrStateContext = createContext<OkrStateContextType>({
  actionStates: {},
  chipStates: {},
  loading: true,
  toggleAction: () => {},
  toggleChip: () => {},
});

export const useOkrState = () => useContext(OkrStateContext);

async function logActivity(actionText: string, actionType: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return;
  await supabase.from('activity_log').insert({
    user_email: user.email,
    action_text: actionText,
    action_type: actionType,
  });
}

export const OkrStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actionStates, setActionStates] = useState<ActionStates>({});
  const [chipStates, setChipStates] = useState<ChipStates>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: actions }, { data: chips }] = await Promise.all([
        supabase.from('action_states').select('action_id, is_done'),
        supabase.from('chip_states').select('chip_key, is_done'),
      ]);
      const as: ActionStates = {};
      actions?.forEach(a => { as[a.action_id] = a.is_done; });
      const cs: ChipStates = {};
      chips?.forEach(c => { cs[c.chip_key] = c.is_done; });
      setActionStates(as);
      setChipStates(cs);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('okr-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'action_states' }, (payload) => {
        const row = payload.new as any;
        if (row) setActionStates(prev => ({ ...prev, [row.action_id]: row.is_done }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chip_states' }, (payload) => {
        const row = payload.new as any;
        if (row) setChipStates(prev => ({ ...prev, [row.chip_key]: row.is_done }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleAction = useCallback(async (actionId: string) => {
    const newVal = !actionStates[actionId];
    setActionStates(prev => ({ ...prev, [actionId]: newVal }));
    
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('action_states').upsert(
      { action_id: actionId, is_done: newVal, updated_at: new Date().toISOString(), updated_by: user?.id },
      { onConflict: 'action_id' }
    );

    const action = ACTIONS.find(a => a.id === actionId);
    if (action) {
      logActivity(action.text, newVal ? 'action_done' : 'action_undone');
    }
  }, [actionStates]);

  const toggleChip = useCallback(async (chipKey: string) => {
    const newVal = !chipStates[chipKey];
    setChipStates(prev => ({ ...prev, [chipKey]: newVal }));
    
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('chip_states').upsert(
      { chip_key: chipKey, is_done: newVal, updated_at: new Date().toISOString(), updated_by: user?.id },
      { onConflict: 'chip_key' }
    );

    // Find action text for the chip
    const actionId = chipKey.split('_').slice(0, -1).join('_');
    const action = ACTIONS.find(a => a.id === actionId);
    if (action) {
      const chipIndex = parseInt(chipKey.split('_').pop() || '0');
      const chipLabel = action.chips?.[chipIndex] || chipKey;
      logActivity(`${action.text} (${chipLabel})`, newVal ? 'chip_done' : 'chip_undone');
    }
  }, [chipStates]);

  return (
    <OkrStateContext.Provider value={{ actionStates, chipStates, loading, toggleAction, toggleChip }}>
      {children}
    </OkrStateContext.Provider>
  );
};
