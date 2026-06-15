export const BOX_TYPES = [
  'SAIDAS_COM_AMIGOS',
  'SAIDAS_EM_CASAL',
  'VIAGENS_EM_CASAL',
  'INTIMO_EM_CASAL',
  'VIAGENS_COM_AMIGOS',
  'EXPERIENCIAS_COM_AMIGOS',
  'SAIR_DA_ROTINA',
  'PRIMEIRAS_VEZES',
  'DESCONFORTO_LEVE',
  'MOMENTOS_DE_CONEXAO',
  'EXPERIENCIAS_DIFERENTES',
] as const;

export type BoxType = (typeof BOX_TYPES)[number];

export const DEFAULT_BOX_TYPE: BoxType = 'SAIDAS_COM_AMIGOS';

export interface Box {
  id: string;
  groupId: string;
  name: string;
  type: BoxType;
  createdAt: string;
  experienceCount: number;
}

export interface Group {
  id: string;
  memberCount: number;
  createdAt: string;
}
