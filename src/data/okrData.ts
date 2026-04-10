export const QUINTAS = ['17/04','24/04','08/05','15/05','22/05','29/05','05/06','12/06','19/06','26/06'];

export interface OkrAction {
  id: string;
  text: string;
  resp: string;
  prazo: string;
  area: AreaKey;
  kr: KrKey;
  sub?: boolean;
  recurrent?: boolean;
  chips?: string[];
  chipLabel?: string;
}

export type AreaKey = 'fiscal' | 'contabil' | 'gp' | 'gestao';
export type KrKey = 'horas' | 'retificacoes' | 'ces' | 'nps';

export interface AreaInfo {
  key: AreaKey;
  name: string;
  color: string;
}

export interface KrInfo {
  key: KrKey;
  name: string;
  fullName: string;
  meta: string;
  objetivo: number;
  fillColor: string;
}

export const AREAS: AreaInfo[] = [
  { key: 'fiscal', name: 'Fiscal', color: '#005216' },
  { key: 'contabil', name: 'Contábil', color: '#36523D' },
  { key: 'gp', name: 'Gestão de Pessoas', color: '#00D141' },
  { key: 'gestao', name: 'Gestão', color: '#0D2601' },
];

export const KRS: KrInfo[] = [
  { key: 'horas', name: 'Horas', fullName: 'Reduzir em 10% as horas dedicadas a rotinas operacionais', meta: '−10% até jun/2026', objetivo: 1, fillColor: '#005216' },
  { key: 'retificacoes', name: 'Retificações', fullName: 'Manter o percentual de retificações abaixo de 1%', meta: '≤ 1% até jun/2026', objetivo: 1, fillColor: '#005216' },
  { key: 'ces', name: 'CES', fullName: 'Manter o CES do trimestre em 4,0 pontos', meta: '≥ 4,0 pts até jun/2026', objetivo: 2, fillColor: '#00D141' },
  { key: 'nps', name: 'NPS', fullName: 'Atingir NPS de 75 pontos no trimestre', meta: '≥ 75 pts até jun/2026', objetivo: 2, fillColor: '#00D141' },
];

export const OBJETIVOS = [
  {
    num: 1,
    name: 'Confiabilidade',
    desc: 'Entregar operações com alta confiabilidade, reduzindo erros e horas improdutivas.',
    krs: ['horas', 'retificacoes'] as KrKey[],
    krLabels: ['Horas (−10%)', 'Retificações (≤1%)'],
  },
  {
    num: 2,
    name: 'Experiência',
    desc: 'Elevar a experiência dos clientes, tornando o atendimento mais fácil e promovendo lealdade.',
    krs: ['ces', 'nps'] as KrKey[],
    krLabels: ['CES (≥4,0)', 'NPS (≥75)'],
  },
];

export const ACTIONS: OkrAction[] = [
  // Fiscal - Horas
  { id: 'fi1', text: 'Estruturar e pacificar operacionalmente o processo principal — Tribo Fiscal', resp: 'Moisés', prazo: 'Jun/2026', area: 'fiscal', kr: 'horas' },
  { id: 'fi2', text: 'Elaborar checklist de validação do processo de Apuração de ISS', resp: 'Moisés', prazo: 'Jun/2026', area: 'fiscal', kr: 'horas', sub: true },
  // Fiscal - Retificações
  { id: 'fi3', text: 'Centralização de particularidades dos clientes no CRM — Fiscal', resp: 'Moisés', prazo: 'Jun/2026', area: 'fiscal', kr: 'retificacoes' },
  // Contábil - Horas
  { id: 'co1', text: '100% das contabilidades recorrentes elegíveis com PLICK cadastradas e configuradas para uso operacional', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'horas' },
  { id: 'co2', text: 'Revisar planilha contábil para classificar os clientes elegíveis à recorrência', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'horas', sub: true },
  { id: 'co3', text: 'Levantar quantidade de clientes por tipo — a cadastrar, affinity, elegíveis, recorrentes', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'horas', sub: true },
  { id: 'co4', text: 'Definir plano de ação para cadastro e atualização do PLICK', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'horas', sub: true },
  { id: 'co5', text: 'Estruturar e pacificar operacionalmente o processo principal — Tribo Contábil', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'horas' },
  { id: 'co6', text: 'Elaborar checklist de validação do processo de Fechamento Contábil', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'horas', sub: true },
  // Contábil - Retificações
  { id: 'co7', text: 'Centralização de particularidades dos clientes no CRM — Contábil', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'retificacoes' },
  // GP - Horas
  { id: 'gp1', text: 'Verificar viabilidade da rotina automática para emissão de guias de FGTS', resp: 'Camila', prazo: 'Jun/2026', area: 'gp', kr: 'horas' },
  { id: 'gp2', text: 'Estruturar e pacificar operacionalmente o processo principal — Tribo Gestão de Pessoas', resp: 'Camila', prazo: 'Jun/2026', area: 'gp', kr: 'horas' },
  { id: 'gp3', text: 'Revisar checklist de validação do processo de FOPAG e utilizá-lo na conferência prática', resp: 'Camila', prazo: 'Jun/2026', area: 'gp', kr: 'horas', sub: true },
  // GP - Retificações
  { id: 'gp6', text: 'Levantamento de sindicatos para estruturação do plano de ação sobre CCTs', resp: 'Camila', prazo: 'Abr/2026', area: 'gp', kr: 'retificacoes' },
  { id: 'gp4', text: 'Levantamento de dados por CCT ou Acordo Coletivo', resp: 'Camila', prazo: 'Mai/2026', area: 'gp', kr: 'retificacoes' },
  { id: 'gp5', text: 'Centralização das informações específicas de cada cliente no CRM — Gestão de Pessoas', resp: 'Camila', prazo: 'Mai/2026', area: 'gp', kr: 'retificacoes', sub: true },
  { id: 'gp7', text: 'Espelhar no portal do cliente as rubricas já utilizadas em folha', resp: 'Camila', prazo: 'Jun/2026', area: 'gp', kr: 'retificacoes' },
  // Gestão - Retificações
  { id: 'ge1', text: 'Levantamento das classificações, motivos, impactos e ações das retificações do último trimestre', resp: 'Bruna', prazo: 'Abr/2026', area: 'gestao', kr: 'retificacoes' },
  { id: 'ge2', text: 'Compartilhar com o time de relacionamento os clientes com maior recorrência de retificações', resp: 'Bruna', prazo: 'Abr/2026', area: 'gestao', kr: 'retificacoes', sub: true },
  { id: 'ge3', text: 'Ajuste do prompt da IA incluindo Convenções Coletivas e arquivos para envio ao cliente', resp: 'Bruna', prazo: 'Mai/2026', area: 'gestao', kr: 'retificacoes' },
  { id: 'ge4', text: 'Definição de cronograma de capacitações técnicas por membro, voltado ao tema de maior recorrência de retificações de cada tribo', resp: 'Bruna', prazo: 'Jun/2026', area: 'gestao', kr: 'retificacoes' },
  // Gestão - CES
  { id: 'ge5', text: 'Diagnóstico dos atendimentos com avaliação negativa de 2025 e do último trimestre', resp: 'Bruna', prazo: 'Abr/2026', area: 'gestao', kr: 'ces' },
  { id: 'ge6', text: 'Aplicar treinamento para o time com base nos motivos mais recorrentes de avaliação negativa', resp: 'Bruna', prazo: 'Mai/2026', area: 'gestao', kr: 'ces' },
  { id: 'ge7', text: 'Manter a prática de avaliar em conjunto os tickets negativos no Zendesk', resp: 'Geral (Time)', prazo: 'Semanal', area: 'gestao', kr: 'ces', recurrent: true, chips: QUINTAS, chipLabel: 'Marcar presença — quintas-feiras' },
  { id: 'ge8', text: 'Mapear atendimentos com avaliação negativa para ação ativa de relacionamento', resp: 'Bruna', prazo: 'Jun/2026', area: 'gestao', kr: 'ces' },
  // Gestão - NPS
  { id: 'ge9', text: 'Mapear os clientes passivos da carteira com base nos últimos resultados de NPS', resp: 'Bruna', prazo: 'Abr/2026', area: 'gestao', kr: 'nps' },
  { id: 'ge10', text: 'Levantar os clientes que não responderam as últimas pesquisas de NPS', resp: 'Bruna', prazo: 'Abr/2026', area: 'gestao', kr: 'nps' },
  { id: 'ge11', text: 'Realizar contato estratégico com os clientes não respondentes, promovendo relacionamento e aumentando promotores', resp: 'Geral (Time)', prazo: 'Mai–Jun/2026', area: 'gestao', kr: 'nps' },
  { id: 'ge12', text: 'Mapear atendimentos com avaliação negativa no último trimestre e os principais motivos', resp: 'Bruna', prazo: 'Jun/2026', area: 'gestao', kr: 'nps' },
  { id: 'ge13', text: 'Levantar para acompanhamento os clientes passivos e as atividades entregues e previstas', resp: 'Geral (Time)', prazo: 'Semanal', area: 'gestao', kr: 'nps', recurrent: true, chips: QUINTAS, chipLabel: 'Registrar acompanhamento — quintas-feiras' },
];

export const GLOSSARIO = [
  { termo: 'OKR', def: 'Objectives and Key Results — metodologia de metas' },
  { termo: 'KR', def: 'Key Result — resultado mensurável que indica progresso' },
  { termo: 'CES', def: 'Customer Effort Score — facilidade do atendimento (meta ≥ 4,0)' },
  { termo: 'NPS', def: 'Net Promoter Score — lealdade e satisfação dos clientes (meta ≥ 75)' },
  { termo: 'FOPAG', def: 'Folha de Pagamento' },
  { termo: 'CCT', def: 'Convenção Coletiva de Trabalho' },
  { termo: 'PLICK', def: 'Sistema de automação contábil recorrente' },
  { termo: 'Horas/rotina', def: 'Indicador de eficiência operacional por hora dedicada a rotinas' },
];

export const CRONOGRAMA = {
  abril: [
    'Levantamento de retificações do 1T',
    'Diagnóstico CES/NPS negativo',
    'Mapeamento de clientes passivos e não respondentes',
    'Levantamento de sindicatos GP',
  ],
  maio: [
    'Treinamento CES',
    'Levantamento de CCTs GP',
    'Ajuste do prompt de IA',
    'Contato com clientes não respondentes',
  ],
  junho: [
    'PLICK 100%',
    'Checklists de processos (Fiscal, Contábil, GP)',
    'Capacitações técnicas',
    'Mapeamento final CES/NPS',
  ],
};
