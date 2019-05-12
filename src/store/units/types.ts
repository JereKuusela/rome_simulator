
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


export class UnitDefinition {
    
    constructor(public type: UnitType, public image: string, public requirements: string, public can_assault: boolean, ) {

    }

    base_values = new Map<UnitCalc, Map<string, number>>()
    base_modifiers = new Map<UnitCalc, Map<string, number>>()

    calculate = (type: UnitCalc) => {
        let base = 0
        const value_base = this.base_values.get(type)
        if (value_base)
            value_base.forEach(value => base += value)
        let modifier = 1.0
        const value_modifier = this.base_modifiers.get(type)
        if (value_modifier)
            value_modifier.forEach(value => modifier += value)
        return base * modifier
    }

    add_base_value = (type: UnitCalc, key: string, value: number) => {
        if (!this.base_values.has(type))
            this.base_values.set(type, new Map<string, number>())
        const value_base = this.base_values.get(type)
        if (!value_base)
            return
        if (value === 0 && value_base.has(key))
            value_base.delete(key)
        else
            value_base.set(key, value)
    }

    add_modifier_value = (type: UnitCalc, key: string, value: number) => {
        if (!this.base_modifiers.has(type))
            this.base_modifiers.set(type, new Map<string, number>())
        const value_modifier = this.base_modifiers.get(type)
        if (!value_modifier)
            return
        if (value === 0 && value_modifier.has(key))
        value_modifier.delete(key)
        else
        value_modifier.set(key, value)
    }
}

export enum UnitCalc {
    Morale,
    Discipline,
    Manpower,
    Offense,
    Defense,
    MoraleDamageTaken,
    StrengthDamageTaken,
    MovementSpeed,
    Maneuver,
    RecruitTime,
    Cost,
    Upkeep,
    AttritionWeight

}

export enum UnitType {
    WarElephant = 'War Elephant',
    LightInfantry = 'Light Infantry',
    LightCavalry = 'Light Cavalry',
    HorseArcher = 'Horse Archer',
    HeavyInfantry = 'Heavy Infantry',
    Chariot = 'Chariot',
    Cavalry = 'Cavalry',
    CamelCavalry = 'Camel Cavalry',
    Archer = 'Archer'
}


// TODO: Allow editing unit properties.
