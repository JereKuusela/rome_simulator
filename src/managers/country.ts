import { Country, Mode, ValuesType, ScopeType, GeneralCalc, ArmyName, UnitType, DefinitionType, UnitValueType, UnitCalc, GovermentType, ReligionType, CultureType, Modifier } from "types"
import { map } from "utils"
import { clearAllValues, addValues, regenerateValues, calculateValue } from "definition_values"

const BASE_MARTIAL_KEY = 'Base stat'

export const setGeneralMartial = (country: Country, mode: Mode, value: number) => {
  enableModifiers(country, mode, BASE_MARTIAL_KEY, [{
    target: 'General',
    type: ValuesType.Base,
    scope: ScopeType.Army,
    attribute: GeneralCalc.Martial,
    value
  }])
}

export const enableModifiers = (country: Country, mode: Mode, key: string, modifiers: Modifier[]) => {
  country.selections[key] = true

  modifiers = modifiers.filter(value => value.scope === ScopeType.Army)
  const definitions = map(country.armies[mode][ArmyName.Army1].general.definitions, definition => clearAllValues(definition, key))
  const otherModifiers = modifiers.filter(value => value.attribute !== GeneralCalc.Martial)

  otherModifiers.forEach(modifier => {
    const type = modifier.target as UnitType | DefinitionType
    if (!definitions[type])
      definitions[type] = {}
    if (modifier.type === ValuesType.Modifier)
      definitions[type] = addValues(definitions[type], ValuesType.Modifier, key, [[modifier.attribute, modifier.value]])
    else
      definitions[type] = addValues(definitions[type], ValuesType.Base, key, [[modifier.attribute, modifier.value]])
  })

  let definition = clearAllValues(country.armies[mode][ArmyName.Army1].general, key)
  const generalModifiers = modifiers.filter(value => value.attribute === GeneralCalc.Martial)
  const generalValues = generalModifiers.map(value => [value.attribute, value.value] as [UnitValueType, number])
  definition = regenerateValues(definition, ValuesType.Base, key, generalValues)
  const martial = calculateValue(definition, GeneralCalc.Martial)
  if (!definitions[DefinitionType.Naval])
      definitions[DefinitionType.Naval] = {}
  definitions[DefinitionType.Naval] = addValues(definitions[DefinitionType.Naval], ValuesType.Base, GeneralCalc.Martial, [[UnitCalc.CaptureChance, 0.002 * martial]])
  definition.definitions = definitions
  country.armies[mode][ArmyName.Army1].general = definition
}

export const clearModifiers = (country: Country, mode: Mode, key: string) => {
  delete country.selections[key]
  
  const definition = clearAllValues(country.armies[mode][ArmyName.Army1].general, key)
  const definitions = map(country.armies[mode][ArmyName.Army1].general.definitions, definition => clearAllValues(definition, key))
  definition.definitions = definitions
  country.armies[mode][ArmyName.Army1].general = definition
}

export const selectGovernment = (country: Country, government: GovermentType) => {
  country.government = government
}

export const selectReligion = (country: Country, religion: ReligionType) => {
  country.religion = religion
}

export const selectCulture = (country: Country, culture: CultureType) => {
  country.culture = culture
}

export const setOmenPower = (country: Country, omen_power: number) => {
  country.omen_power = omen_power
}

export const setHasGeneral = (country: Country, mode: Mode, has_general: boolean) => {
  country.armies[mode][ArmyName.Army1].general.enabled = has_general
}

export const setMilitaryPower = (country: Country, military_power: number) => {
  country.military_power = military_power
}

export const setOfficeDiscipline = (country: Country, office_discipline: number) => {
  country.office_discipline = office_discipline
}

export const setOfficeMorale = (country: Country, office_morale: number) => {
  country.office_morale = office_morale
}
