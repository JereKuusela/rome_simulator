import { Map } from 'immutable'
import { UnitType , UnitDefinition, UnitCalc} from './types'
import IconArcher from '../../images/archer.png'


const setBaseValues = (unit: UnitDefinition): UnitDefinition => {
    unit = unit.add_base_value(UnitCalc.AttritionWeight, 'base', 1)
    unit = unit.add_base_value(UnitCalc.Defense, 'base', 1)
    unit = unit.add_base_value(UnitCalc.Discipline, 'base', 1)
    unit = unit.add_base_value(UnitCalc.Maneuver, 'base', 1)
    unit = unit.add_base_value(UnitCalc.Manpower, 'base', 1000)
    unit = unit.add_base_value(UnitCalc.Morale, 'base', 3)
    unit = unit.add_base_value(UnitCalc.MoraleDamageTaken, 'base', 1)
    unit = unit.add_base_value(UnitCalc.Offense, 'base', 1)
    unit = unit.add_base_value(UnitCalc.StrengthDamageTaken, 'base', 1)
    unit = unit.add_base_value(UnitType.Archer, 'base', 1)
    unit = unit.add_base_value(UnitType.CamelCavalry, 'base', 1)
    unit = unit.add_base_value(UnitType.Chariot, 'base', 1)
    unit = unit.add_base_value(UnitType.HeavyInfantry, 'base', 1)
    unit = unit.add_base_value(UnitType.HeavyCavalry, 'base', 1)
    unit = unit.add_base_value(UnitType.HorseArcher, 'base', 1)
    unit = unit.add_base_value(UnitType.LightCavalry, 'base', 1)
    unit = unit.add_base_value(UnitType.LightInfantry, 'base', 1)
    unit = unit.add_base_value(UnitType.WarElephant, 'base', 1)
    return unit
}

export const getDefaultDefinitions = (): Map<UnitType, UnitDefinition> => {
    let map = Map<UnitType, UnitDefinition>()
    let unit = new UnitDefinition(UnitType.Archer, IconArcher, 'None', true, Map(), Map())
    unit = setBaseValues(unit)
    unit = unit.add_modifier_value(UnitCalc.AttritionWeight, 'archer', -0.1)
    unit = unit.add_base_value(UnitCalc.Cost, 'archer', 4)
    unit = unit.add_modifier_value(UnitCalc.Morale, 'no commander', -0.25)
    unit = unit.add_modifier_value(UnitCalc.MoraleDamageTaken, 'archer', 0.25)
    unit = unit.add_base_value(UnitCalc.MovementSpeed, 'archer', 2)
    unit = unit.add_base_value(UnitCalc.RecruitTime, 'archer', 45)
    unit = unit.add_base_value(UnitCalc.Upkeep, 'archer', 0.21)
    unit = unit.add_modifier_value(UnitType.CamelCavalry, 'archer', -0.1)
    unit = unit.add_modifier_value(UnitType.HeavyCavalry, 'archer', -0.1)
    unit = unit.add_modifier_value(UnitType.LightCavalry, 'archer', -0.1)
    unit = unit.add_modifier_value(UnitType.LightInfantry, 'archer', 0.25)

    map = map.set(UnitType.Archer,  unit)
    return map
}