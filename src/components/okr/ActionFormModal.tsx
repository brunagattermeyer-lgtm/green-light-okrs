import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AREAS, KRS, AreaKey, KrKey, RESP_OPTIONS, RESP_AREA_MAP } from '@/data/okrData';
import Modal from './Modal';

interface ActionFormModalProps {
  open: boolean;
  onClose: () => void;
  editData?: {
    id: string;
    action_text: string;
    responsaveis: string[];
    prazo: string;
    area: string;
    kr: string;
    direcionamento?: string;
    is_action_plan: boolean;
    follow_up_dates?: string[];
  } | null;
}

const ActionFormModal: React.FC<ActionFormModalProps> = ({ open, onClose, editData }) => {
  const [text, setText] = useState(editData?.action_text || '');
  const [responsaveis, setResponsaveis] = useState<string[]>(editData?.responsaveis || []);
  const [prazo, setPrazo] = useState(editData?.prazo || '');
  const [area, setArea] = useState(editData?.area || 'gestao');
  const [kr, setKr] = useState(editData?.kr || 'horas');
  const [direcionamento, setDirecionamento] = useState(editData?.direcionamento || '');
  const [isActionPlan, setIsActionPlan] = useState(editData?.is_action_plan || false);
  const [followUpDates, setFollowUpDates] = useState<string[]>(editData?.follow_up_dates || ['']);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!editData;

  const toggleResp = (r: string) => {
    const newResp = responsaveis.includes(r) ? responsaveis.filter(x => x !== r) : [...responsaveis, r];
    setResponsaveis(newResp);
    // Auto-associate area based on first selected responsible
    if (!responsaveis.includes(r) && RESP_AREA_MAP[r]) {
      setArea(RESP_AREA_MAP[r]);
    }
  };

  const validatePrazo = (val: string): boolean => {
    return /^\d{2}\/\d{2}\/\d{2}$/.test(val);
  };

  const validateFollowUpDate = (val: string): boolean => {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(val);
  };

  const handleSave = async () => {
    setError('');
    if (!text.trim()) return setError('Informe o texto da ação.');
    if (responsaveis.length === 0) return setError('Selecione ao menos um responsável.');
    if (!prazo.trim()) return setError('Informe o prazo.');
    if (prazo.trim() && !validatePrazo(prazo.trim())) {
      return setError('O prazo deve estar no formato dd/mm/aa.');
    }
    if (isActionPlan) {
      const validDates = followUpDates.filter(d => d.trim());
      if (validDates.length === 0) {
        return setError('Plano de ação requer ao menos uma data de acompanhamento.');
      }
      for (const d of validDates) {
        if (!validateFollowUpDate(d)) {
          return setError('Datas de acompanhamento devem estar no formato dd/mm/aaaa.');
        }
      }
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      action_text: text.trim(),
      responsaveis,
      prazo: prazo.trim(),
      area,
      kr,
      direcionamento: direcionamento.trim() || null,
      is_action_plan: isActionPlan,
      follow_up_dates: isActionPlan ? followUpDates.filter(d => d.trim()) : null,
      updated_by: user?.id,
    };

    let result;
    if (isEditing && editData) {
      result = await supabase.from('custom_actions').update(payload).eq('id', editData.id);
    } else {
      result = await supabase.from('custom_actions').insert({ ...payload, created_by: user?.id });
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    // Create subtasks
    if (!isEditing && subtasks.length > 0) {
      const parentResult = await supabase.from('custom_actions').select('id').eq('action_text', text.trim()).order('created_at', { ascending: false }).limit(1);
      const parentId = parentResult.data?.[0]?.id;
      if (parentId) {
        for (const st of subtasks.filter(s => s.trim())) {
          await supabase.from('custom_actions').insert({
            action_text: st.trim(),
            responsaveis,
            prazo: prazo.trim(),
            area,
            kr,
            is_subtask: true,
            parent_action_id: parentId,
            created_by: user?.id,
            updated_by: user?.id,
          });
        }
      }
    }

    // Log activity
    if (user?.email) {
      await supabase.from('activity_log').insert({
        user_email: user.email,
        action_text: text.trim(),
        action_type: isEditing ? 'action_edited' : 'action_created',
      });
    }

    setSaving(false);
    onClose();
  };

  const addFollowUpDate = () => setFollowUpDates(prev => [...prev, '']);
  const removeFollowUpDate = (i: number) => setFollowUpDates(prev => prev.filter((_, idx) => idx !== i));
  const updateFollowUpDate = (i: number, val: string) => {
    setFollowUpDates(prev => prev.map((d, idx) => idx === i ? val : d));
  };

  const addSubtask = () => setSubtasks(prev => [...prev, '']);
  const removeSubtask = (i: number) => setSubtasks(prev => prev.filter((_, idx) => idx !== i));
  const updateSubtask = (i: number, val: string) => {
    setSubtasks(prev => prev.map((s, idx) => idx === i ? val : s));
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Editar ação' : 'Nova ação'} maxWidth="560px">
      <div className="space-y-4">
        {/* Action text */}
        <div>
          <label className="block text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-1">
            Ação *
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-okr-bl bg-okr-su text-okr-dk text-sm focus:outline-none focus:ring-2 focus:ring-okr-fo resize-none"
            placeholder="Descreva a ação..."
          />
        </div>

        {/* Responsáveis */}
        <div>
          <label className="block text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-1.5">
            Responsáveis *
          </label>
          <div className="flex flex-wrap gap-1.5">
            {RESP_OPTIONS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => toggleResp(r)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  responsaveis.includes(r)
                    ? 'bg-okr-fo text-white border-okr-fo'
                    : 'bg-okr-su text-okr-dk border-okr-bo hover:border-okr-fo'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Prazo */}
        <div>
          <label className="block text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-1">
            Prazo * <span className="text-okr-bo font-normal">(dd/mm/aa)</span>
          </label>
          <input
            type="text"
            value={prazo}
            onChange={e => setPrazo(e.target.value)}
            placeholder="Ex: 30/06/26"
            maxLength={8}
            className="w-full px-3 py-2 rounded-lg border border-okr-bl bg-okr-su text-okr-dk text-sm focus:outline-none focus:ring-2 focus:ring-okr-fo"
          />
        </div>

        {/* Area & KR */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-1">Área</label>
            <select
              value={area}
              onChange={e => setArea(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-okr-bl bg-okr-su text-okr-dk text-sm focus:outline-none focus:ring-2 focus:ring-okr-fo"
            >
              {AREAS.filter(a => a.key !== 'todos').map(a => (
                <option key={a.key} value={a.key}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-1">KR</label>
            <select
              value={kr}
              onChange={e => setKr(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-okr-bl bg-okr-su text-okr-dk text-sm focus:outline-none focus:ring-2 focus:ring-okr-fo"
            >
              {KRS.map(k => (
                <option key={k.key} value={k.key}>{k.name} — {k.fullName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Direcionamento */}
        <div>
          <label className="block text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-1">
            Direcionamento operacional <span className="text-okr-bo">(opcional)</span>
          </label>
          <textarea
            value={direcionamento}
            onChange={e => setDirecionamento(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-okr-bl bg-okr-su text-okr-dk text-sm focus:outline-none focus:ring-2 focus:ring-okr-fo resize-none"
          />
        </div>

        {/* Action plan checkbox */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActionPlan}
              onChange={e => setIsActionPlan(e.target.checked)}
              className="w-4 h-4 rounded border-okr-bo text-okr-fo focus:ring-okr-fo"
            />
            <span className="text-sm text-okr-dk">É um plano de ação</span>
          </label>
        </div>

        {/* Follow-up dates (if action plan) */}
        {isActionPlan && (
          <div>
            <label className="block text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-1.5">
              Datas de acompanhamento * <span className="text-okr-bo font-normal">(dd/mm/aaaa)</span>
            </label>
            <div className="space-y-2">
              {followUpDates.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={d}
                    onChange={e => updateFollowUpDate(i, e.target.value)}
                    placeholder="Ex: 15/05/2026"
                    maxLength={10}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-okr-bl bg-okr-su text-okr-dk text-sm focus:outline-none focus:ring-2 focus:ring-okr-fo"
                  />
                  {followUpDates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFollowUpDate(i)}
                      className="text-okr-lt hover:text-red-500 text-sm transition-colors"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFollowUpDate}
                className="text-xs text-okr-fo hover:text-okr-dk transition-colors"
              >
                + Adicionar data
              </button>
            </div>
          </div>
        )}

        {/* Subtasks */}
        {!isEditing && (
          <div>
            <label className="block text-[11px] font-medium text-okr-lt uppercase tracking-wider mb-1.5">
              Subtasks <span className="text-okr-bo">(opcional)</span>
            </label>
            <div className="space-y-2">
              {subtasks.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={s}
                    onChange={e => updateSubtask(i, e.target.value)}
                    placeholder="Descreva a subtask..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-okr-bl bg-okr-su text-okr-dk text-sm focus:outline-none focus:ring-2 focus:ring-okr-fo"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(i)}
                    className="text-okr-lt hover:text-red-500 text-sm transition-colors"
                  >
                    x
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSubtask}
                className="text-xs text-okr-fo hover:text-okr-dk transition-colors"
              >
                + Adicionar subtask
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-red-600 text-xs">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-okr-mi hover:bg-okr-bl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-okr-fo text-white hover:bg-okr-dk transition-colors disabled:opacity-50"
          >
            {saving ? '...' : isEditing ? 'Salvar' : 'Criar ação'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ActionFormModal;
