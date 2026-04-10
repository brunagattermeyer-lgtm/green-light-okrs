export const QUINTAS = ['17/04','24/04','08/05','15/05','22/05','29/05','05/06','12/06','19/06','26/06'];

export interface OkrAction {
  id: string;
  text: string;
  resp: string;
  prazo: string;
  area: AreaKey;
  kr: KrKey;
  sub?: boolean;
  parentId?: string;
  recurrent?: boolean;
  chips?: string[];
  chipLabel?: string;
  direcionamento?: string;
  expectativas?: string[];
}

export type AreaKey = 'fiscal' | 'contabil' | 'gp' | 'gestao' | 'todos';
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
  { key: 'todos', name: 'Todos', color: '#4a7c59' },
];

export const KRS: KrInfo[] = [
  { key: 'horas', name: 'Horas', fullName: 'Reduzir em 10% o total de horas dedicadas em rotinas', meta: '−10% até jun/2026', objetivo: 1, fillColor: '#005216' },
  { key: 'retificacoes', name: 'Retificações', fullName: '% retificações ≤ 1%', meta: '≤ 1% até jun/2026', objetivo: 1, fillColor: '#005216' },
  { key: 'ces', name: 'CES', fullName: 'Manter o CES do trimestre em 4,0 pontos', meta: '≥ 4,0 pts até jun/2026', objetivo: 2, fillColor: '#00D141' },
  { key: 'nps', name: 'NPS', fullName: 'NPS >= 75', meta: '≥ 75 pts até jun/2026', objetivo: 2, fillColor: '#00D141' },
];

export const OBJETIVOS = [
  {
    num: 1,
    name: 'Garantir confiabilidade operacional nas entregas',
    desc: '',
    krs: ['horas', 'retificacoes'] as KrKey[],
    krLabels: ['Reduzir em 10% o total de horas dedicadas em rotinas', '% retificações ≤ 1%'],
  },
  {
    num: 2,
    name: 'Tornar a experiência do cliente mensurável e confiável',
    desc: '',
    krs: ['ces', 'nps'] as KrKey[],
    krLabels: ['Manter o CES do trimestre em 4,0 pontos', 'NPS >= 75'],
  },
];

export const ACTIONS: OkrAction[] = [
  // ===== OBJETIVO 1 — CONFIABILIDADE =====
  // KR: Reduzir em 10% o total de horas dedicadas em rotinas

  // GP - Horas
  { id: 'gp1', text: 'Verificar viabilidade de utilização da rotina automática para emissão das guias de FGTS', resp: 'Camila', prazo: 'Jun/2026', area: 'gp', kr: 'horas',
    direcionamento: 'Realizar treinamento que compreenda a rotina automática de FGTS digital e listar quais premissas ou o que seria necessário para realizar a emissão do FGTS digital pela rotina.',
    expectativas: ['Listagem das premissas', 'Plano de ação estruturado para contemplação das premissas', 'Previsão de início da utilização da ferramenta', 'Definição de nova ação contemplada pela confirmação da viabilidade, se aplicável'],
  },

  // Contábil - Horas
  { id: 'co1', text: '100% das nossas contabilidades recorrentes, elegíveis e affinity que temos a possibilidade de utilização do PLICK cadastradas e configuradas para utilização operacional', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'horas' },
  { id: 'co2', text: 'Revisão da planilha contábil de forma a classificar corretamente quais são os clientes elegíveis a recorrência', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'horas',
    direcionamento: 'Reclassificação na planilha contábil de forma que a classificação entre recorrente, atualizar e elegível a recorrência esteja de acordo com os critérios aqui definidos',
    expectativas: ['Ter a validação dos documentos (últimos 3 meses - novo processo AD)', 'Fechamento contábil realizado nos últimos 3 meses', 'Save Financeiro'],
  },
  { id: 'co3', text: 'Fazer o levantamento de quantos clientes temos em cada tipo', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'horas',
    direcionamento: 'Listagem detalhada de total de clientes a cadastrar, total de affinitys, total de elegíveis, total de recorrentes',
  },
  { id: 'co4', text: 'Definição de plano de ação para cadastro e atualização do PLICK destes clientes', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'horas',
    direcionamento: 'Plano de ação com datas fracionadas de entregas e % de conclusão estimado para aquela data, responsáveis pela entrega, definição de nova ação de acompanhamento desse plano de ação de forma conjunta, definição de feito desse cadastro e parametrização',
  },

  // Fiscal - Horas
  { id: 'fi1', text: 'Estruturar e pacificar operacionalmente o principal processo - Tribo Fiscal', resp: 'Moisés', prazo: 'Jun/2026', area: 'fiscal', kr: 'horas',
    direcionamento: 'Revisitar o fluxograma do processo de Apuração do ISS e pontuar de acordo com o processo o que de fato já é aplicado e se está coerente com o processo pré definido, se existe alguma divergência entre teoria x prática',
    expectativas: ['Listagem de todos os pontos identificados como inconformidade do processo'],
  },
  { id: 'fi2', text: 'Elaborar checklist de validação desse processo', resp: 'Moisés', prazo: 'Jun/2026', area: 'fiscal', kr: 'horas', sub: true, parentId: 'fi1',
    direcionamento: 'Checklist de conferência do processo de apuração de ISS revisado e aplicado na prática com data de aplicação prática dessa conferência estruturada com registro em tarefas',
  },

  // Contábil - Horas (processo)
  { id: 'co5', text: 'Estruturar e pacificar operacionalmente o principal processo - Tribo Contábil', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'horas',
    direcionamento: 'Revisitar o fluxograma do processo de Fechamento Contábil e pontuar de acordo com o processo o que de fato já é aplicado e se está coerente com o processo pré definido, se existe alguma divergência entre teoria x prática',
    expectativas: ['Listagem de todos os pontos identificados como inconformidade do processo'],
  },
  { id: 'co6', text: 'Elaborar checklist de validação desse processo', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'horas', sub: true, parentId: 'co5',
    expectativas: ['Revisão do checklist de conferência de documentos financeiros enviados pelo cliente', 'Listagem de todos os pontos identificados como inconformidade do processo ou que não se aplicaria ao checklist de fato', 'Criação de checklist de conferências a serem feitas no processo de fechamento contábil a fim de mapear tudo o que precisa ser revisado dentro desse processo'],
  },

  // GP - Horas (processo)
  { id: 'gp2', text: 'Estruturar e pacificar operacionalmente o principal processo - Tribo Gestão de Pessoas', resp: 'Camila', prazo: 'Jun/2026', area: 'gp', kr: 'horas',
    direcionamento: 'Revisitar o fluxograma do processo de Folha de Pagamento e pontuar de acordo com o processo o que de fato já é aplicado e se está coerente com o processo pré definido, se existe alguma divergência entre teoria x prática',
    expectativas: ['Listagem de todos os pontos identificados como inconformidade do processo'],
  },
  { id: 'gp3', text: 'Revisar checklist de validação desse processo e utilizar na conferência prática', resp: 'Camila', prazo: 'Jun/2026', area: 'gp', kr: 'horas', sub: true, parentId: 'gp2',
    direcionamento: 'Checklist de conferência do processo de Folha de Pagamento revisado e aplicado na prática com data de aplicação prática dessa conferência estruturada com registro em tarefas',
  },

  // ===== KR: % retificações ≤ 1% =====

  // Gestão - Retificações
  { id: 'ge1', text: 'Levantamento das classificações, motivos, impactos e ações das retificações do último trimestre', resp: 'Bruna', prazo: 'Abr/2026', area: 'gestao', kr: 'retificacoes' },
  { id: 'ge2', text: '#retcli - devemos compartilhar com relacionamento os clientes com maior recorrência e os motivos, para ações paralelas', resp: 'Bruna', prazo: 'Abr/2026', area: 'gestao', kr: 'retificacoes', sub: true, parentId: 'ge1',
    direcionamento: 'Envio para o time de relacionamento de um relatório ou panorama geral das retificações',
  },

  // GP - Retificações
  { id: 'gp7', text: 'Espelhar no portal do cliente as rubricas já utilizadas em folha', resp: 'Camila', prazo: 'Jun/2026', area: 'gp', kr: 'retificacoes' },
  { id: 'gp6', text: 'Levantamento de sindicatos (patronal e laboral) para realizar plano de ação para o tópico 3', resp: 'Camila', prazo: 'Abr/2026', area: 'gp', kr: 'retificacoes' },
  { id: 'gp4', text: 'Levantamento de dados por CCT ou Acordo coletivo', resp: 'Camila', prazo: 'Mai/2026', area: 'gp', kr: 'retificacoes',
    direcionamento: 'sindicatos patronal e laboral, data base, data de vencimento das contribuições, datas de pagamentos excepcionais previstos, alguma particularidade da CCT',
  },
  { id: 'gp5', text: 'Centralização dessas informações particulares nas observações e nos campos disponíveis do CRM - Gestão de Pessoas', resp: 'Camila', prazo: 'Mai/2026', area: 'gp', kr: 'retificacoes', sub: true, parentId: 'gp4' },

  // Contábil - Retificações
  { id: 'co7', text: 'Centralização de informações de particularidades nas observações e nos campos disponíveis do CRM - Contábil', resp: 'Shirley / Karina', prazo: 'Jun/2026', area: 'contabil', kr: 'retificacoes',
    direcionamento: 'Levantamento de todos os clientes que já foram atuados pelas responsáveis atuais e identificação de particularidades ou observações relevantes para a posteridade e colocar tudo isso nas observações no CRM',
  },

  // Fiscal - Retificações
  { id: 'fi3', text: 'Centralização de informações de particularidades nas observações e nos campos disponíveis do CRM - Fiscal', resp: 'Moisés', prazo: 'Jun/2026', area: 'fiscal', kr: 'retificacoes',
    direcionamento: 'Levantamento das informações de particularidades dos clientes e colocar nas observações do CRM',
  },

  // Gestão - Retificações (cont.)
  { id: 'ge3', text: 'Ajuste do prompt da IA incluindo as Convenções Coletivas, arquivos anexados em tarefa para envio ao cliente', resp: 'Bruna', prazo: 'Mai/2026', area: 'gestao', kr: 'retificacoes' },
  { id: 'ge4', text: 'Definição de cronograma de capacitações técnicas específicas para cada membro do time, voltado para o tema de maior recorrência de retificações ou o tema de maior dúvida de cada tribo', resp: 'Bruna', prazo: 'Jun/2026', area: 'gestao', kr: 'retificacoes' },

  // ===== OBJETIVO 2 — EXPERIÊNCIA =====
  // KR: Manter o CES do trimestre em 4,0 pontos

  { id: 'ge5', text: 'Fazer diagnóstico dos atendimentos negativos de 2025 e do último trimestre', resp: 'Bruna', prazo: 'Abr/2026', area: 'gestao', kr: 'ces' },
  { id: 'ge6', text: 'Aplicar treinamento para o time com base nos motivos mais recorrentes de avaliação negativa', resp: 'Bruna', prazo: 'Mai/2026', area: 'gestao', kr: 'ces' },
  { id: 'ge7', text: 'Manter a prática de avaliar em conjunto de forma regular os tickets negativos no Zendesk', resp: 'Geral (Time)', prazo: 'Semanal', area: 'todos', kr: 'ces', recurrent: true, chips: QUINTAS, chipLabel: 'Marcar presença — quintas-feiras (a partir de 16/04)' },
  { id: 'ge8', text: 'Mapear para relacionamento os atendimentos com avaliação negativa, a fim de proporcionar uma ação ativa da ATLC', resp: 'Bruna', prazo: 'Jun/2026', area: 'gestao', kr: 'ces' },

  // KR: NPS >= 75
  { id: 'ge9', text: 'Mapear os passivos da carteira com base nos últimos NPS', resp: 'Bruna', prazo: 'Abr/2026', area: 'gestao', kr: 'nps' },
  { id: 'ge10', text: 'Levantamento dos clientes que não responderam as últimas publicações de NPS', resp: 'Bruna', prazo: 'Abr/2026', area: 'gestao', kr: 'nps' },
  { id: 'ge11', text: 'Contato estratégico com os clientes que não responderam os últimos NPS a fim de aumentar nossos promotores promovendo um bom relacionamento com os que não responderam', resp: 'Geral (Time)', prazo: 'Mai–Jun/2026', area: 'todos', kr: 'nps' },
  { id: 'ge12', text: 'Mapear para relacionamento os atendimentos com avaliação negativa no ultimo trimestre e os principais motivos', resp: 'Bruna', prazo: 'Jun/2026', area: 'gestao', kr: 'nps' },
  { id: 'ge13', text: 'Levantar para o RADAR identificação dos clientes passivos e atividades entregues nas semanas para eles e atividades prevista para os próximos dias', resp: 'Geral (Time)', prazo: 'Semanal', area: 'gestao', kr: 'nps', recurrent: true, chips: QUINTAS, chipLabel: 'Registrar acompanhamento — quintas-feiras (a partir de 16/04)' },
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
