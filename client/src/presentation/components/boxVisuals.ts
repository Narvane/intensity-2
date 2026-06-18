import {
  Coffee,
  Compass,
  Gamepad2,
  Heart,
  Map,
  PartyPopper,
  Rocket,
  Sparkles,
  TentTree,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import type { BoxType } from '@domain/box/boxTypes';

interface BoxVisual {
  family: 'friends' | 'couple' | 'growth' | 'connection';
  Icon: LucideIcon;
}

const VISUALS: Record<BoxType, BoxVisual> = {
  SAIDAS_COM_AMIGOS: { family: 'friends', Icon: Coffee },
  SAIDAS_EM_CASAL: { family: 'couple', Icon: Heart },
  VIAGENS_EM_CASAL: { family: 'couple', Icon: Map },
  INTIMO_EM_CASAL: { family: 'couple', Icon: Sparkles },
  VIAGENS_COM_AMIGOS: { family: 'friends', Icon: TentTree },
  EXPERIENCIAS_COM_AMIGOS: { family: 'friends', Icon: Gamepad2 },
  SAIR_DA_ROTINA: { family: 'growth', Icon: Compass },
  PRIMEIRAS_VEZES: { family: 'growth', Icon: Rocket },
  DESCONFORTO_LEVE: { family: 'growth', Icon: PartyPopper },
  MOMENTOS_DE_CONEXAO: { family: 'connection', Icon: UsersRound },
  EXPERIENCIAS_DIFERENTES: { family: 'connection', Icon: Sparkles },
};

export function getBoxVisual(type: BoxType): BoxVisual {
  return VISUALS[type];
}
