import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('okr-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'action_states' }, (payload) => {
        const row = payload.new as any;
        if (row) {
          setActionStates(prev => ({ ...prev, [row.action_id]: row.is_done }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chip_states' }, (payload) => {
        const row = payload.new as any;
        if (row) {
          setChipStates(prev => ({ ...prev, [row.chip_key]: row.is_done }));
        }
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
  }, [actionStates]);

  const toggleChip = useCallback(async (chipKey: string) => {
    const newVal = !chipStates[chipKey];
    setChipStates(prev => ({ ...prev, [chipKey]: newVal }));
    
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('chip_states').upsert(
      { chip_key: chipKey, is_done: newVal, updated_at: new Date().toISOString(), updated_by: user?.id },
      { onConflict: 'chip_key' }
    );
  }, [chipStates]);

  return (
    <OkrStateContext.Provider value={{ actionStates, chipStates, loading, toggleAction, toggleChip }}>
      {children}
    </OkrStateContext.Provider>
  );
};
