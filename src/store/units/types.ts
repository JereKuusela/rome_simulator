
import { Map } from 'immutable'

export enum UnitActionTypes {
    SET_ATTACKER_BASE_VALUE = '@@unit/SET_ATTACKER_BASE_VALUE',
    SET_ATTACKER_MODIFIER_VALUE = '@@unit/SET_ATTACKER_MODIFIER_VALUE',
    SET_DEFENDER_BASE_VALUE = '@@unit/SET_DEFENDER_BASE_VALUE',
    SET_DEFENDER_MODIFIER_VALUE = '@@unit/SET_DEFENDER_MODIFIER_VALUE'
  }

export interface UnitsState {
    readonly attacker: Map<UnitType, UnitDefinition>
    readonly defender: Map<UnitType, UnitDefinition>
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
    
    constructor(public type: UnitType, public image: string, public requirements: string, public can_assault: boolean, ) {

    }

    base_values = Map<UnitCalc | UnitType, Map<string, number>>()
    base_modifiers = Map<UnitCalc | UnitType, Map<string, number>>()

    toPercent = (number: number) => +(number * 100).toFixed(2) + '%'

    calculate = (type: UnitCalc | UnitType) => {
        let base = 0
        const value_base = this.base_values.get(type)
        if (value_base)
            value_base.forEach(value => base += value)
        let modifier = 1.0
        const value_modifier = this.base_modifiers.get(type)
        if (value_modifier)
            value_modifier.forEach(value => modifier += value)
        switch (type){
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
        const value_modifier = this.base_modifiers.get(type)
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

    add_base_value = (type: UnitCalc | UnitType, key: string, value: number) => {
        if (!this.base_values.has(type))
            this.base_values = this.base_values.set(type, Map<string, number>())
        const value_base = this.base_values.get(type)
        if (!value_base)
            return
        if (value === 0 && value_base.has(key))
            this.base_values = this.base_values.set(type, value_base.delete(key))
        else
            this.base_values = this.base_values.set(type, value_base.set(key, value))
    }

    add_modifier_value = (type: UnitCalc | UnitType, key: string, value: number) => {
        if (!this.base_modifiers.has(type))
            this.base_modifiers = this.base_modifiers.set(type, Map<string, number>())
        const value_modifier = this.base_modifiers.get(type)
        if (!value_modifier)
            return
        if (value === 0 && value_modifier.has(key))
            this.base_modifiers = this.base_modifiers.set(type, value_modifier.delete(key))
        else
            this.base_modifiers = this.base_modifiers.set(type, value_modifier.set(key, value))
    }
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
