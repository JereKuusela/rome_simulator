import { Map, OrderedMap } from 'immutable'
import { BaseDefinition } from '../../utils'
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

export const tactic_to_icon = Map<TacticType, string>()
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
type MapValues = Map<ValueType, Map<string, number>>

export class TacticDefinition extends BaseDefinition<TacticType, ValueType> {

  constructor(type: TacticType, public readonly image: string, base_values: MapValues = Map()) {
    super(type, base_values)
  }

  valueToString = (type: ValueType): string => {
    const value = this.calculateValue(type)
    return this.toPercent(value)
  }

  add_base_values = (key: string, values: [ValueType, number][]): TacticDefinition => {
    const new_values = this.add_values(this.base_values, key, values)
    return new TacticDefinition(this.type, this.image, new_values)
  }

  add_base_value = (key: string, type: ValueType, value: number): TacticDefinition => {
    const new_values = this.add_values(this.base_values, key, [[type, value]])
    return new TacticDefinition(this.type, this.image, new_values)
  }
}

const createTacticFromJson = (data: TacticData): TacticDefinition => {
  let tactic = new TacticDefinition(data.type as TacticType, tactic_to_icon.get(data.type as TacticType)!)
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
  tactic = tactic.add_base_value('Base', TacticCalc.Casualties, 1)
  return tactic.add_base_values(tactic.type, base_values)
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
