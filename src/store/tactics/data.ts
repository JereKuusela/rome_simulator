import { Map, OrderedMap } from 'immutable'
import { UnitType , UnitDefinition, UnitCalc} from '../units/types'
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
import  * as data from './tactics.json';

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
        map = map.set(tactic.type,  tactic)
    }
    return map
}

type ValueType = UnitType | TacticCalc | TacticType
type MapValues = Map<ValueType, Map<string, number>>

export class TacticDefinition {

    constructor(public readonly type: TacticType, public readonly image: string,
        public readonly base_values: MapValues = Map()) {}

    toPercent = (number: number) => +(number * 100).toFixed(2) + '%'

    calculateValue = (type: ValueType): number => {
        let base = 0
        const value_base = this.base_values.get(type)
        if (value_base)
            value_base.forEach(value => base += value)
        return base
    }

    valueToString = (type: ValueType): string => {
        const value = this.calculateValue(type)
        return this.toPercent(value)
    }

    explain = (type: ValueType) => {
        let base = 0
        const value_base = this.base_values.get(type)
        if (value_base)
            value_base.forEach(value => base += value)
        let explanation = 'Base value ' + this.toPercent(base)
        if (value_base) {
            explanation += ' ('
            value_base.forEach((value, key) => explanation += key + ': ' + this.toPercent(value) + ',')
            explanation = explanation.substring(0, explanation.length - 1) + ')'
        }
        return explanation
    }

    add_base_values = (key: string, values: [ValueType, number][]): TacticDefinition => {
        const new_values = this.add_values(this.base_values, key, values)
        return new TacticDefinition(this.type, this.image, new_values)
    }

    add_base_value = (key: string, type: ValueType, value: number): TacticDefinition => {
        const new_values = this.add_values(this.base_values, key, [[type, value]])
        return new TacticDefinition(this.type, this.image, new_values)
    }

    private add_values = (container: MapValues, key: string, values: [ValueType, number][]): MapValues => {
        let new_values = container
        for (const [type, value] of values) {
            new_values = new_values.has(type) ? new_values : new_values.set(type, Map<string, number>())
            const type_values = new_values.get(type)
            if (!type_values)
                return new_values
            if (value === 0 && type_values.has(key))
                new_values = new_values.set(type, type_values.delete(key))
            else
                new_values = new_values.set(type, type_values.set(key, value))
        }
        return new_values
    }

    get_base_value = (type: ValueType, key: string): number => this.get_value(this.base_values, type, key)

    private get_value = (container: MapValues, type: ValueType, key: string): number => {
        const values = container.get(type)
        if (!values)
            return 0
        const value = values.get(key)
        if (!value)
            return 0
        return value
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
