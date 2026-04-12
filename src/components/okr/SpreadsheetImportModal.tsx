import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Modal from './Modal';

const ALLOWED_EMAIL = 'bruna.gattermeyer@atlantico.digital';

interface SpreadsheetImport {
  id: string;
  file_name: string;
  file_path: string;
  imported_by_email: string;
  created_at: string;
}

interface SpreadsheetImportModalProps {
  open: boolean;
  onClose: () => void;
  imports: SpreadsheetImport[];
  onRefresh: () => void;
}

const SpreadsheetImportModal: React.FC<SpreadsheetImportModalProps> = ({ open, onClose, imports, onRefresh }) => {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const canImport = user?.email === ALLOWED_EMAIL;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);

    const filePath = `${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from('spreadsheets')
      .upload(filePath, file);

    if (uploadErr) {
      setError(uploadErr.message);
      setUploading(false);
      return;
    }

    const { error: insertErr } = await supabase.from('spreadsheet_imports').insert({
      file_name: file.name,
      file_path: filePath,
      imported_by: user!.id,
      imported_by_email: user!.email!,
    });

    if (insertErr) {
      setError(insertErr.message);
      setUploading(false);
      return;
    }

    // Log
    await supabase.from('activity_log').insert({
      user_email: user!.email!,
      action_text: file.name,
      action_type: 'spreadsheet_imported',
    });

    setUploading(false);
    onRefresh();
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDelete = async (imp: SpreadsheetImport) => {
    await supabase.storage.from('spreadsheets').remove([imp.file_path]);
    await supabase.from('spreadsheet_imports').delete().eq('id', imp.id);

    await supabase.from('activity_log').insert({
      user_email: user!.email!,
      action_text: imp.file_name,
      action_type: 'spreadsheet_deleted',
    });

    onRefresh();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal open={open} onClose={onClose} title="Planilhas importadas" maxWidth="560px">
      {canImport && (
        <div className="mb-4">
          <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-okr-bo hover:border-okr-fo cursor-pointer transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span className="text-sm text-okr-mi">{uploading ? 'Enviando...' : 'Importar planilha'}</span>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        </div>
      )}

      {!canImport && (
        <p className="text-xs text-okr-lt mb-4">Apenas bruna.gattermeyer@atlantico.digital pode importar planilhas.</p>
      )}

      {imports.length === 0 ? (
        <p className="text-xs text-okr-lt text-center py-6">Nenhuma planilha importada ainda.</p>
      ) : (
        <div className="space-y-2">
          {imports.map(imp => (
            <div key={imp.id} className="flex items-center justify-between p-3 rounded-lg border border-okr-bl">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-okr-dk font-medium truncate">{imp.file_name}</p>
                <p className="text-[10px] text-okr-lt">
                  {imp.imported_by_email} · {formatDate(imp.created_at)}
                </p>
              </div>
              {canImport && (
                <button
                  onClick={() => handleDelete(imp)}
                  className="text-xs text-red-500 hover:text-red-700 ml-3 flex-shrink-0 transition-colors"
                >
                  Excluir
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default SpreadsheetImportModal;
