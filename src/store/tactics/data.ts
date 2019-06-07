import { Map, OrderedMap, List, fromJS } from 'immutable'
import { calculateValue, BaseValuesDefinition, toPercent, add_base_values } from '../../base_definition'
import { UnitType } from '../units/types'
import IconBottleneck from '../../images/bottleneck.png'
import IconCavalrySkirmish from '../../images/cavalry_skirmish.png'
import IconDeception from '../../images/deception.png'
import IconEnvelopment from '../../images/envelopment.png'
import IconHitAndRun from '../../images/hit_and_run.png'
import IconPadmaVyuha from '../../images/padma_vyuha.png'
import IconPhalanx from '../../images/phalanx.png'
import IconShockAction from '../../images/shock_action.png'
import IconSkirmishing from '../../images/skirmishing.png'
import IconTriplexAcies from '../../images/triplex_acies.png'
import * as data from './tactics.json'

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
  TriplexAcies = 'Triplex Acies'
}

const tactic_to_icon = Map<TacticType, string>()
  .set(TacticType.Bottleneck, IconBottleneck)
  .set(TacticType.CavalrySkirmish, IconCavalrySkirmish)
  .set(TacticType.Deception, IconDeception)
  .set(TacticType.Envelopment, IconEnvelopment)
  .set(TacticType.HitAndRun, IconHitAndRun)
  .set(TacticType.PadmaVyuha, IconPadmaVyuha)
  .set(TacticType.Phalanx, IconPhalanx)
  .set(TacticType.ShockAction, IconShockAction)
  .set(TacticType.Skirmishing, IconSkirmishing)
  .set(TacticType.TriplexAcies, IconTriplexAcies)

export const getDefaultDefinitions = (): Map<TacticType, TacticDefinition> => {
  let map = OrderedMap<TacticType, TacticDefinition>()
  for (const value of data.tactics) {
    const tactic = createTacticFromJson(value)
    map = map.set(tactic.type, tactic)
  }
  return map
}

export type ValueType = UnitType | TacticCalc | TacticType


export const getDefaultTypes = (): List<TacticType> => {
  const tactics = Object.keys(TacticType).map(k => TacticType[k as any]) as TacticType[]
  return List<TacticType>(tactics)
}

export const tacticFromJS = (object: Map<string, any>): TacticDefinition | undefined => {
  if (!object)
    return undefined
  let base_values = object.has('base_values') ? fromJS(object.get('base_values')!.map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  const type = object.get('type') as TacticType
  let image = object.get('image')
  if (!image)
    image = tactic_to_icon.get(type)
  return { type, image, base_values }
}

export interface TacticDefinition extends BaseValuesDefinition<TacticType, ValueType> {
}

export const valueToString = (definition: TacticDefinition, type: ValueType): string => {
  const value = calculateValue(definition, type)
  return toPercent(value, true)
}

const createTacticFromJson = (data: TacticData): TacticDefinition => {
  let tactic: TacticDefinition = { type: data.type as TacticType, image: tactic_to_icon.get(data.type as TacticType) }
  const base_values: [ValueType, number][] = [
    [UnitType.Archers, data.archers || 0],
    [UnitType.CamelCavalry, data.camel_cavalry || 0],
    [UnitType.Chariots, data.chariots || 0],
    [UnitType.HeavyCavalry, data.heavy_cavalry || 0],
    [UnitType.HeavyInfantry, data.heavy_infantry || 0],
    [UnitType.HorseArchers, data.horse_archers || 0],
    [UnitType.LightCavalry, data.light_cavalry || 0],
    [UnitType.LightInfantry, data.light_infantry || 0],
    [UnitType.WarElephants, data.war_elephants || 0],
    [TacticCalc.Casualties, data.casualties || 0],
    [TacticType.Bottleneck, data.bottleneck || 0],
    [TacticType.CavalrySkirmish, data.cavalry_skirmish || 0],
    [TacticType.Deception, data.deception || 0],
    [TacticType.Envelopment, data.envelopment || 0],
    [TacticType.HitAndRun, data.hit_and_run || 0],
    [TacticType.PadmaVyuha, data.padma_vyuha || 0],
    [TacticType.Phalanx, data.phalanx || 0],
    [TacticType.ShockAction, data.shock_action || 0],
    [TacticType.Skirmishing, data.skirmishing || 0],
    [TacticType.TriplexAcies, data.triplex_acies || 0]

  ]
  return add_base_values(tactic, tactic.type, base_values)
}

interface TacticData {
  type: string
  archers?: number
  camel_cavalry?: number
  chariots?: number
  heavy_cavalry?: number
  heavy_infantry?: number
  horse_archers?: number
  light_cavalry?: number
  light_infantry?: number
  war_elephants?: number
  bottleneck?: number
  cavalry_skirmish?: number
  deception?: number
  envelopment?: number
  hit_and_run?: number,
  padma_vyuha?: number,
  phalanx?: number,
  shock_action?: number,
  skirmishing?: number,
  triplex_acies?: number,
  casualties?: number

}
