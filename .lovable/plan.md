

# Plano de ajustes no app de OKRs

## Resumo das mudanças

Este plano cobre todas as solicitações: correção de textos e dados, nova lógica de contagem, log de atividade, alertas de prazo, melhorias visuais nos gráficos, e ajustes de tipografia.

---

## 1. Atualizar dados e textos (okrData.ts)

**Objetivos** — atualizar nomes e descrições:
- Objetivo 1: "Garantir confiabilidade operacional nas entregas"
- Objetivo 2: "Tornar a experiência do cliente mensurável e confiável"

**KRs** — atualizar `fullName`:
- Horas: "Reduzir em 10% o total de horas dedicadas em rotinas"
- Retificações: "% retificações ≤ 1%"
- CES: "Manter o CES do trimestre em 4,0 pontos" (já correto)
- NPS: "NPS >= 75"

**Ações** — reescrever todos os textos das ações usando exatamente as palavras do JSON fornecido. Adicionar novo campo `direcionamento?: string` à interface `OkrAction` para armazenar o "Direcionamento Operacional" de cada ação. Também adicionar campo `expectativas?: string[]` para as expectativas de entrega. Reorganizar subtasks conforme o JSON (algumas ações que eram subtasks agora são ações principais e vice-versa — ex: as ações de revisão de planilha contábil, levantamento de clientes, plano de ação PLICK são ações independentes no novo JSON, não subtasks).

Ajustar as áreas de algumas ações conforme o JSON (ex: ações de CES/NPS com `area: 'gestao'` mas algumas com area "Todos").

## 2. Nova lógica de contagem (progressCalc.ts)

**Regras novas:**
- **Subtasks NÃO contam como ações** na contagem de "X de Y ações concluídas"
- **Subtasks CONTRIBUEM para o % de progresso** — cada subtask contribui proporcionalmente ao progresso da ação principal
- **Ações recorrentes** contam como 1 ação; os chips de datas são acompanhamento e NÃO inflam a contagem
- Progresso recorrente = proporção de chips concluídos (mantém)
- **Eliminar decimais**: exibir sempre números inteiros ("0 de 9 ações concluídas", nunca "0.0 de 9.0")
- **Nunca usar "unidades"** — sempre "ações concluídas"

Refatorar `calcProgress` para separar:
- `countActions()` → conta apenas ações principais (não-sub) para exibição "X de Y"
- `calcPercent()` → calcula % incluindo contribuição de subtasks e chips

## 3. Tooltip com Direcionamento Operacional (ActionItem.tsx)

No tooltip "i" dentro dos modais de área, mostrar o campo `direcionamento` e `expectativas` quando existirem, formatados com destaque.

## 4. Fonte das datas (chip de prazo)

Remover `font-mono` do chip de prazo nos ActionItems — usar a mesma fonte do resto (DM Sans).

## 5. Modal de Objetivos (ObjetivosModal.tsx)

Mostrar apenas os dois objetivos com os nomes corretos, sem sub-descrição longa. Manter os KRs vinculados.

## 6. Log de atividade (nova feature)

**Database:** Criar tabela `activity_log` via migration:
```sql
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  action_text text NOT NULL,
  action_type text NOT NULL, -- 'action_done', 'action_undone', 'chip_done', 'chip_undone'
  created_at timestamptz DEFAULT now()
);
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
-- Políticas para autenticados lerem e inserirem
```
Habilitar Realtime nessa tabela.

**Frontend:**
- No header, ao lado do email + "Sair", adicionar botão "..." (três pontos) com dropdown
- Opção "Mostrar log" abre sidebar deslizante do lado direito
- Sidebar mostra lista cronológica: "bruna.gattermeyer@atlantico.digital marcou como concluída a ação [texto] no dia 10/04/2026 às 10:12"
- Gravar no `activity_log` toda vez que toggleAction ou toggleChip for chamado no OkrStateContext
- Sidebar com Realtime para atualizar ao vivo

**Componentes:** `src/components/okr/ActivityLogSidebar.tsx`

## 7. Gráficos melhorados (OkrCharts.tsx)

- **Barras mais grossas**: aumentar `maxBarThickness` de 40 para 60-70
- **Rosca maior**: aumentar a altura do container, e usar cores com mais contraste:
  - Objetivo 1: `#005216` (verde floresta)
  - Objetivo 2: `#00D141` (verde brilhante) — troca do `#36523D` que era parecido demais

## 8. Alertas de prazo (nova feature)

**Componente:** `src/components/okr/DeadlineAlerts.tsx`

**Utilitário:** `src/lib/deadlineUtils.ts`
- Parsear prazos: "Abr/2026" → 30/04/2026, "Mai/2026" → 31/05/2026, "Jun/2026" → 30/06/2026
- "Mai–Jun/2026" → último mês (30/06/2026)
- "Semanal" → verificar chips de quintas passadas sem marcação
- Classificar: vencida (prazo < hoje e não concluída), próxima (vence em 7 dias)

**UI:** Seção no dashboard entre os cards de métricas e os KRs:
- Cards de alerta com ícone de aviso
- Badge vermelho "Vencida" para ações atrasadas
- Badge amarelo "Próxima" para ações que vencem em breve
- Chips de quintas passadas sem marcação também aparecem como alerta
- Cada alerta clicável, abre o modal da área correspondente

---

## Arquivos afetados

| Arquivo | Tipo de mudança |
|---|---|
| `src/data/okrData.ts` | Reescrita completa dos textos, adição de campos `direcionamento` e `expectativas` |
| `src/lib/progressCalc.ts` | Refatorar contagem para separar "ações" de "progresso %" |
| `src/lib/deadlineUtils.ts` | Novo — parsing de prazos e classificação |
| `src/components/okr/ActionItem.tsx` | Tooltip com direcionamento, remover font-mono do prazo |
| `src/components/okr/Dashboard.tsx` | Integrar alertas, sidebar de log, números inteiros, trocar "unidades" |
| `src/components/okr/ObjetivosModal.tsx` | Textos dos objetivos atualizados |
| `src/components/okr/OkrCharts.tsx` | Barras mais grossas, rosca com mais contraste |
| `src/components/okr/DeadlineAlerts.tsx` | Novo — painel de alertas de prazo |
| `src/components/okr/ActivityLogSidebar.tsx` | Novo — sidebar de log de atividade |
| `src/contexts/OkrStateContext.tsx` | Gravar no activity_log ao toggle |
| Migration SQL | Nova tabela `activity_log` + Realtime |

