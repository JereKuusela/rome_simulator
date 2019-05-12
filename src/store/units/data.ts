import { UnitType , UnitDefinition, UnitCalc} from './types'
import IconArcher from '../../images/archer.png'



export const getDefaultDefinitions = (): Map<UnitType, UnitDefinition> => {
    let map = new Map<UnitType, UnitDefinition>()
    let unit = new UnitDefinition(UnitType.Archer, IconArcher, 'None', true)
    unit.add_base_value(UnitCalc.AttritionWeight, 'base', 1)
    unit.add_modifier_value(UnitCalc.AttritionWeight, 'base', -0.1)
    unit.add_base_value(UnitCalc.Cost, 'base', 4)
    unit.add_base_value(UnitCalc.Defense, 'base', 1)
    unit.add_base_value(UnitCalc.Discipline, 'base', 1)
    unit.add_base_value(UnitCalc.Maneuver, 'base', 1)
    unit.add_base_value(UnitCalc.Manpower, 'base', 1000)
    unit.add_base_value(UnitCalc.Morale, 'base', 3)
    unit.add_modifier_value(UnitCalc.Morale, 'no commander', -0.25)
    unit.add_base_value(UnitCalc.MoraleDamageTaken, 'base', 1)
    unit.add_modifier_value(UnitCalc.MoraleDamageTaken, 'base', 0.25)
    unit.add_base_value(UnitCalc.MovementSpeed, 'base', 2)
    unit.add_base_value(UnitCalc.Offense, 'base', 1)
    unit.add_base_value(UnitCalc.RecruitTime, 'base', 45)
    unit.add_base_value(UnitCalc.StrengthDamageTaken, 'base', 1)
    unit.add_base_value(UnitCalc.Upkeep, 'base', 0.21)


    map.set(UnitType.Archer,  unit)
    return map
}