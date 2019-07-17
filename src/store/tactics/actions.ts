import { createAction } from 'typesafe-actions'
import { UnitType } from '../units/'
import { BaseValuesDefinition, DefinitionType } from '../../base_definition'

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

export type ValueType = UnitType | TacticCalc | TacticType

export interface TacticDefinition extends BaseValuesDefinition<TacticType, ValueType> {
}

export const setBaseValue = createAction('@@tactics/SET_BASE_VALUE', action => {
  return (tactic: TacticType, key: string, attribute: ValueType, value: number) => action({ tactic,  key, attribute, value })
})

export const deleteTactic = createAction('@@tactics/DELETE_TACTIC', action => {
  return (type: TacticType) => action({ type })
})

export const addTactic = createAction('@@tactics/ADD_TACTIC', action => {
  return (type: TacticType, mode: DefinitionType) => action({ type, mode })
})

export const changeType = createAction('@@tactics/CHANGE_TYPE', action => {
  return (old_type: TacticType, new_type: TacticType) => action({ old_type, new_type })
})

export const changeMode = createAction('@@tactics/CHANGE_MODE', action => {
  return (type: TacticType, mode: DefinitionType) => action({ type, mode })
})

export const changeImage = createAction('@@tactics/CHANGE_IMAGE', action => {
  return (type: TacticType, image: string) => action({ type, image })
})
