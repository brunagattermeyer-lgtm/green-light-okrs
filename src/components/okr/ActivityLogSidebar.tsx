import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LogEntry {
  id: string;
  user_email: string;
  action_text: string;
  action_type: string;
  created_at: string;
}

interface ActivityLogSidebarProps {
  open: boolean;
  onClose: () => void;
}

const ActivityLogSidebar: React.FC<ActivityLogSidebarProps> = ({ open, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const fetchLogs = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setLogs((data as LogEntry[]) || []);
      setLoading(false);
    };
    fetchLogs();
  }, [open]);

  // Realtime
  useEffect(() => {
    if (!open) return;
    const channel = supabase
      .channel('activity-log-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, (payload) => {
        const row = payload.new as LogEntry;
        setLogs(prev => [row, ...prev].slice(0, 100));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [open]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'action_done': return 'marcou como concluida';
      case 'action_undone': return 'desmarcou';
      case 'chip_done': return 'marcou presenca em';
      case 'chip_undone': return 'desmarcou presenca em';
      case 'action_created': return 'criou a acao';
      case 'action_edited': return 'editou a acao';
      case 'spreadsheet_imported': return 'importou a planilha';
      case 'spreadsheet_deleted': return 'excluiu a planilha';
      default: return type;
    }
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-[380px] max-w-[90vw] bg-okr-su border-l border-okr-bl shadow-xl z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-okr-bl">
          <h2 className="text-sm font-semibold text-okr-dk">Log de atividade</h2>
          <button onClick={onClose} className="text-okr-lt hover:text-okr-dk transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 5L13 13M13 5L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-56px)] p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-okr-fo border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-okr-lt text-center py-8">Nenhuma atividade registrada ainda.</p>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="border-b border-okr-bl pb-3 last:border-0">
                  <p className="text-xs text-okr-dk leading-relaxed">
                    <span className="font-medium">{log.user_email}</span>{' '}
                    {typeLabel(log.action_type)} a ação{' '}
                    <span className="font-medium text-okr-fo">"{log.action_text}"</span>
                  </p>
                  <p className="text-[10px] text-okr-lt mt-1">{formatDate(log.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityLogSidebar;
