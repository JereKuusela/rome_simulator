import { UnitType, Data, Mode } from 'types'
import { DataValues } from 'data_values'

export enum TacticCalc {
  Casualties = 'Casualties'
}

export enum TacticType {
  Bottleneck = 'Bottleneck',
  CavalrySkirmish = 'Cavalry Skirmish',
  Deception = 'Deception',
  Envelopment = 'Envelopment',
  HitAndRun = 'Hit-and-Run',
  PadmaVyuha = 'Padma Vyuha',
  Phalanx = 'Phalanx',
  ShockAction = 'Shock Action',
  Skirmishing = 'Skirmishing',
  TriplexAcies = 'Triplex Acies',
  FrontalAssault = 'Frontal Assault',
  NavalEnvelopment = 'Naval Envelopment',
  CloseRanks = 'Close Ranks',
  Harassment = 'Harassment',
  ProbingAttack = 'Probing Attack'
}

export type TacticsData = Record<TacticType, TacticData>

export type TacticValueType = UnitType | TacticCalc | TacticType

export interface TacticData extends Data<TacticType>, DataValues<TacticValueType> {
  mode: Mode
}

export enum TacticMatch {
  Neutral = 'Neutral',
  Positive = 'Positive',
  Negative = 'Negative'
}

export type Tactic = {
  type: TacticType
  effect: number
  match: TacticMatch
  damage: number
  casualties: number
  image: string
}

export const dictionaryTacticType: { [key: string]: TacticType } = {
  shock_action: TacticType.ShockAction,
  envelopment: TacticType.Envelopment,
  skirmishing: TacticType.Skirmishing,
  deception: TacticType.Deception,
  bottleneck: TacticType.Bottleneck,
  greek_phalanx: TacticType.Phalanx,
  triplex_acies: TacticType.TriplexAcies,
  cavalry_skirmish: TacticType.CavalrySkirmish,
  padma_vyuha: TacticType.PadmaVyuha,
  hit_and_run_tactics: TacticType.HitAndRun,
  frontal_assault: TacticType.FrontalAssault,
  naval_envelopment: TacticType.NavalEnvelopment,
  close_ranks: TacticType.CloseRanks,
  harassment: TacticType.Harassment,
  probing_attack: TacticType.ProbingAttack
}
