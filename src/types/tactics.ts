import { UnitType, Definition, Mode } from 'types'
import { DefinitionValues } from 'definition_values'

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

export type Tactics = { [key in TacticType]: Tactic }

export type TacticValueType = UnitType | TacticCalc | TacticType

export interface Tactic extends Definition<TacticType>, DefinitionValues<TacticValueType> {
  mode: Mode
}
