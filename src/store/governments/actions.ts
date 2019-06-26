import { createAction } from 'typesafe-actions'
import { List } from 'immutable'
import { UnitType } from '../units'
import { DefinitionType } from '../../base_definition'

export enum ModifierType {
  Text = 'Text',
  Siege = 'Siege',
  Fort = 'Fort'
}

export enum TraditionType {
  Celtic = 'Celtic',
  Greek = 'Greek',
  Latin = 'Latin',
  Levantine = 'Levantine',
  Mauryan = 'Mauryan',
  NorthAfrican = 'North African',
  Persian = 'Persian'
}

export interface Modifier {
  readonly type: UnitType | DefinitionType | ModifierType
  readonly attribute: string
  readonly value: number
}
export interface Tradition {
  readonly name: string
  readonly modifiers: List<Modifier>
}
export interface Path {
  readonly name: string
  readonly traditions: List<Tradition>
}
export interface TraditionDefinition {
  readonly type: TraditionType
  readonly paths: List<Path>
}
