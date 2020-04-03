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

export type TacticDefinitions = { [key in TacticType]: TacticDefinition }

export type TacticValueType = UnitType | TacticCalc | TacticType

export interface TacticDefinition extends Definition<TacticType>, DefinitionValues<TacticValueType> {
  mode: Mode
}

export type Tactic = {
  type: TacticType
  effect: number
  damage: number
  casualties: number
  image: string
}