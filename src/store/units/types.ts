
import { Map } from 'immutable'

export enum UnitActionTypes {
    SET_BASE_VALUE = '@@unit/SET_BASE_VALUE',
    SET_MODIFIER_VALUE = '@@unit/SET_MODIFIER_VALUE'
}

export interface UnitsState {
    readonly units: Map<ArmyType, Map<UnitType, UnitDefinition>>
}

export interface UnitDefinitionA {
    type: UnitType
    discipline: number
    manpower: number
    offense: number
    defense: number
    morale: number
    morale_damage_taken: number
    strength_damage_taken: number
    attrition_weight: number
    damage_multipliers: Map<UnitType, number>
    movement_speed: number
    can_assault: boolean
    cost: number
    maneuver: number
    recruit_time: number
    upkeep: number
    requirements: string
    image: string
}


export enum UnitCalc {
    Morale = 'Morale',
    Discipline = 'Discipline',
    Manpower = 'Manpower',
    Offense = 'Offense',
    Defense = 'Defense',
    MoraleDamageTaken = 'Morale damage taken',
    StrengthDamageTaken = 'Strength damage taken',
    MovementSpeed = 'Movement speed',
    Maneuver = 'Maneuver',
    RecruitTime = 'Recruit time',
    Cost = 'Cost',
    Upkeep = 'Upkeep',
    AttritionWeight = 'Attrition weight'

}

export class UnitDefinition {

    constructor(public readonly type: UnitType, public readonly image: string, public readonly requirements: string, public readonly can_assault: boolean,
        public readonly base_values: Map<UnitCalc | UnitType, Map<string, number>>, public readonly modifier_values: Map<UnitCalc | UnitType, Map<string, number>>) {

    }

    toPercent = (number: number) => +(number * 100).toFixed(2) + '%'

    calculate = (type: UnitCalc | UnitType) => {
        let base = 0
        const value_base = this.base_values.get(type)
        if (value_base)
            value_base.forEach(value => base += value)
        let modifier = 1.0
        const value_modifier = this.modifier_values.get(type)
        if (value_modifier)
            value_modifier.forEach(value => modifier += value)
        switch (type) {
            case UnitCalc.Cost:
            case UnitCalc.Maneuver:
            case UnitCalc.Manpower:
            case UnitCalc.Morale:
            case UnitCalc.MovementSpeed:
            case UnitCalc.RecruitTime:
            case UnitCalc.Upkeep:
                return base * modifier
            default:
                return this.toPercent(base * modifier)
        }
    }

    explain = (type: UnitCalc | UnitType) => {
        let base = 0
        const value_base = this.base_values.get(type)
        if (value_base)
            value_base.forEach(value => base += value)
        let explanation = 'Base value ' + base
        if (value_base) {
            explanation += ' ('
            value_base.forEach((value, key) => explanation += key + ': ' + value + ',')
            explanation = explanation.substring(0, explanation.length - 1) + ')'
        }
        let modifier = 1.0
        const value_modifier = this.modifier_values.get(type)
        if (value_modifier)
            value_modifier.forEach(value => modifier += value)
        explanation += ' multiplied by ' + this.toPercent(modifier)
        if (value_modifier && value_modifier.size > 0) {
            explanation += ' ('
            value_modifier.forEach((value, key) => explanation += key + ': ' + this.toPercent(value) + ',')
            explanation = explanation.substring(0, explanation.length - 1) + ')'
        }
        return explanation
    }

    add_base_value = (type: UnitCalc | UnitType, key: string, value: number): UnitDefinition => {
        const new_values = this.add_value(this.base_values, type, key, value)
        return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, new_values, this.modifier_values)
    }

    add_modifier_value = (type: UnitCalc | UnitType, key: string, value: number): UnitDefinition => {
        const new_values = this.add_value(this.modifier_values, type, key, value)
        return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, this.base_values, new_values)
    }

    private add_value = (container: Map<UnitCalc | UnitType, Map<string, number>>, type: UnitCalc | UnitType, key: string, value: number): Map<UnitCalc | UnitType, Map<string, number>> => {
        let new_values = container.has(type) ? container : container.set(type, Map<string, number>())
        const values = new_values.get(type)
        if (!values)
            return new_values
        if (value === 0 && values.has(key))
            new_values = new_values.set(type, values.delete(key))
        else
            new_values = new_values.set(type, values.set(key, value))
        return new_values
    }

    get_base_value = (type: UnitCalc | UnitType, key: string): number => this.get_value(this.base_values, type, key)

    get_modifier_value = (type: UnitCalc | UnitType, key: string): number => this.get_value(this.modifier_values, type, key)

    private get_value = (container: Map<UnitCalc | UnitType, Map<string, number>>, type: UnitCalc | UnitType, key: string): number => {
        const values = container.get(type)
        if (!values)
            return 0
        const value = values.get(key)
        if (!value)
            return 0
        return value
    }
}

export enum ArmyType {
    Attacker = 'Attacker',
    Defender = 'Defender'
}


export enum UnitType {
    WarElephant = 'War Elephant',
    LightInfantry = 'Light Infantry',
    LightCavalry = 'Light Cavalry',
    HorseArcher = 'Horse Archer',
    HeavyInfantry = 'Heavy Infantry',
    Chariot = 'Chariot',
    HeavyCavalry = 'Heavy Cavalry',
    CamelCavalry = 'Camel Cavalry',
    Archer = 'Archer'
}


// TODO: Allow editing unit properties.
