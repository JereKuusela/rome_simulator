
import { Map } from 'immutable'

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
        public readonly base_values: Map<UnitCalc | UnitType, Map<string, number>> = Map(), public readonly modifier_values: Map<UnitCalc | UnitType, Map<string, number>> = Map()) {

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

    add_base_values = (key: string, values: [UnitCalc | UnitType, number][]): UnitDefinition => {
        const new_values = this.add_values(this.base_values, key, values)
        return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, new_values, this.modifier_values)
    }

    add_base_value = (key: string, type: UnitCalc | UnitType, value: number): UnitDefinition => {
        const new_values = this.add_values(this.base_values, key, [[type, value]])
        return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, new_values, this.modifier_values)
    }

    add_modifier_values = (key: string, values: [UnitCalc | UnitType, number][]): UnitDefinition => {
        const new_values = this.add_values(this.modifier_values, key, values)
        return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, this.base_values, new_values)
    }

    add_modifier_value = (key: string, type: UnitCalc | UnitType, value: number): UnitDefinition => {
        const new_values = this.add_values(this.modifier_values, key, [[type, value]])
        return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, this.base_values, new_values)
    }

    private add_values = (container: Map<UnitCalc | UnitType, Map<string, number>>, key: string, values: [UnitCalc | UnitType, number][]): Map<UnitCalc | UnitType, Map<string, number>> => {
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
    Archers = 'Archers',
    WarElephants = 'War Elephants',
    LightInfantry = 'Light Infantry',
    LightCavalry = 'Light Cavalry',
    HorseArchers = 'Horse Archers',
    HeavyInfantry = 'Heavy Infantry',
    Chariots = 'Chariots',
    HeavyCavalry = 'Heavy Cavalry',
    CamelCavalry = 'Camel Cavalry'
}


// TODO: Allow editing unit properties.
