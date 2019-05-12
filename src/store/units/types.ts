
export interface UnitsState {
    readonly attacker: Map<UnitType, UnitDefinition>
    readonly defender: Map<UnitType, UnitDefinition>
}

export interface UnitDefinition {
    type: UnitType
    discipline: number
    manpower: number
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


export enum UnitType {
    WarElephant,
    LightInfantry,
    LightCavalry,
    HorseArcher,
    HeavyInfantry,
    Chariot,
    Cavalry,
    CamelCavalry,
    Archer
}


// TODO: Allow editing unit properties.
