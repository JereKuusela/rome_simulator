import { UnitType , UnitDefinition} from './types'



export const getDefaultDefinitions = (): Map<UnitType, UnitDefinition> => {
    let map = new Map<UnitType, UnitDefinition>()
    map.set(UnitType.Archer, {
        type: UnitType.Archer,
        discipline: 1,
        manpower: 1000,
        cost: 4,
        recruit_time: 45,
        upkeep: 0.21,
        requirements: 'None',
        can_assault: true,
        movement_speed: 2,
        maneuver: 1,
        morale_damage_taken: 1.25,
        strength_damage_taken: 1,
        attrition_weight: 0.9,
        damage_multipliers: new Map<UnitType, number>(),
        image: 'archer.png'
    })
    return map
}