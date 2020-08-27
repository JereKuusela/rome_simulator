
import { sumBy, values } from 'lodash'
import { Terrain, UnitType, CohortDefinition, UnitAttribute, Setting, Settings, CombatPhase, UnitValueType, Cohort, CohortProperties, DisciplineValue, CountryName, ArmyName } from 'types'
import { toObj, map, noZero } from 'utils'
import { calculateValue, calculateValueWithoutLoss, calculateBase } from 'definition_values'
import { calculateExperienceReduction } from './combat_utils'

export const getProperties = (countryName: CountryName, armyName: ArmyName, participantIndex: number, index: number, settings: Settings, terrains: Terrain[], unitTypes: UnitType[], cohort: CohortDefinition): CohortProperties => {
  const damageReduction = precalculateDamageReduction(cohort, settings)
  const properties = {
    index,
    armyName,
    countryName,
    participantIndex,
    type: cohort.type,
    isLoyal: !!cohort.isLoyal,
    image: cohort.image,
    maxMorale: calculateValueWithoutLoss(cohort, UnitAttribute.Morale),
    maxStrength: calculateValueWithoutLoss(cohort, UnitAttribute.Strength),
    experienceReduction: calculateExperienceReduction(settings, cohort),
    // Unmodified value is used to determine deployment order.
    deploymentCost: calculateBase(cohort, UnitAttribute.Cost),
    tech: cohort.tech,
    mode: cohort.mode,
    role: cohort.role,
    parent: cohort.parent,
    damage: getDamages(settings, terrains, unitTypes, cohort),
    damageTakenMultiplier: damageReduction,
    moraleTakenMultiplier: damageReduction * getValue(cohort, UnitAttribute.MoraleDamageTaken, settings[Setting.AttributeMoraleDamage]),
    strengthTakenMultiplier: applyPhaseDamageTaken(cohort, damageReduction * getValue(cohort, UnitAttribute.StrengthDamageTaken, settings[Setting.AttributeStrengthDamage]))
  } as CohortProperties
  values(UnitAttribute).forEach(calc => { properties[calc] = calculateValue(cohort, calc) })
  values(CombatPhase).forEach(calc => { properties[calc] = calculateValue(cohort, calc) })
  terrains.forEach(({ type }) => { properties[type] = calculateValue(cohort, type) })
  unitTypes.forEach(calc => { properties[calc] = calculateValue(cohort, calc) })
  return properties
}

/**
 * Transforms a unit to a combat unit.
 */
export const getCombatUnit = (countryName: CountryName, armyName: ArmyName, participantIndex: number, index: number, settings: Settings, terrains: Terrain[], unitTypes: UnitType[], cohort: CohortDefinition): Cohort => ({
  [UnitAttribute.Morale]: calculateValue(cohort, UnitAttribute.Morale),
  [UnitAttribute.Strength]: calculateValue(cohort, UnitAttribute.Strength),
  state: { target: null, targetSupport: null, flanking: false, moraleLoss: 0, strengthLoss: 0, moraleDealt: 0, strengthDealt: 0, damageMultiplier: 0, isDefeated: false, defeatedBy: null, defeatedDay: 0, isDestroyed: false, totalMoraleDealt: 0, totalStrengthDealt: 0 },
  properties: getProperties(countryName, armyName, participantIndex, index, settings, terrains, unitTypes, cohort),
  isWeak: false
})

const applyPhaseDamageDone = (unit: CohortDefinition, value: number) => ({
  [CombatPhase.Default]: value,
  [CombatPhase.Fire]: value * (1.0 + calculateValue(unit, UnitAttribute.FireDamageDone)),
  [CombatPhase.Shock]: value * (1.0 + calculateValue(unit, UnitAttribute.ShockDamageDone))
})

const applyPhaseDamageTaken = (unit: CohortDefinition, value: number) => ({
  [CombatPhase.Default]: value,
  [CombatPhase.Fire]: value * (1.0 + calculateValue(unit, UnitAttribute.FireDamageTaken)),
  [CombatPhase.Shock]: value * (1.0 + calculateValue(unit, UnitAttribute.ShockDamageTaken))
})

const applyPhaseDamage = (unit: CohortDefinition, value: number) => ({
  [CombatPhase.Default]: value,
  [CombatPhase.Fire]: value * calculateValue(unit, CombatPhase.Fire),
  [CombatPhase.Shock]: value * calculateValue(unit, CombatPhase.Shock)
})

const applyUnitTypes = (unit: CohortDefinition, unitTypes: UnitType[], settings: Settings, values: { [key in CombatPhase]: number }) => (
  toObj(unitTypes, type => type, type => map(values, damage => damage * getValue(unit, type, settings[Setting.AttributeUnitType])))
)

const applyDamageTypes = (unit: CohortDefinition, settings: Settings, values: { [key in UnitType]: { [key in CombatPhase]: number } }) => {
  const moraleDone = getValue(unit, UnitAttribute.MoraleDamageDone, settings[Setting.AttributeMoraleDamage]) * settings[Setting.MoraleLostMultiplier] / 1000.0
  const strengthDone = applyPhaseDamageDone(unit, getValue(unit, UnitAttribute.StrengthDamageDone, settings[Setting.AttributeStrengthDamage]) * settings[Setting.StrengthLostMultiplier] / 1000.0)
  return {
    [UnitAttribute.Strength]: map(values, values => map(values, (value, phase) => value * strengthDone[phase])),
    [UnitAttribute.Morale]: map(values, values => map(values, value => value * moraleDone)),
    'Damage': values
  }
}

const getDamages = (settings: Settings, terrains: Terrain[], unitTypes: UnitType[], cohort: CohortDefinition) => (
  applyDamageTypes(cohort, settings, applyUnitTypes(cohort, unitTypes, settings, applyPhaseDamage(cohort, precalculateDamage(terrains, cohort, settings))))
)

const getValue = (unit: CohortDefinition, attribute: UnitValueType, enabled: boolean) => 1.0 + getMultiplier(unit, attribute, enabled)
const getMultiplier = (unit: CohortDefinition, attribute: UnitValueType, enabled: boolean) => enabled ? calculateValue(unit, attribute) : 0

const precalculateDamage = (terrains: Terrain[], unit: CohortDefinition, settings: Settings) => (
  settings[Setting.Precision]
  * getValue(unit, UnitAttribute.Discipline, settings[Setting.AttributeDiscipline] === DisciplineValue.Both || settings[Setting.AttributeDiscipline] === DisciplineValue.Damage)
  * getValue(unit, UnitAttribute.CombatAbility, settings[Setting.AttributeCombatAbility])
  * getValue(unit, UnitAttribute.DamageDone, settings[Setting.AttributeDamage])
  * (1.0 + sumBy(terrains, terrain => getMultiplier(unit, terrain.type, settings[Setting.AttributeTerrainType])))
  * (settings[Setting.AttributeLoyal] && unit.isLoyal ? 1.1 : 1.0)
)

const precalculateDamageReduction = (unit: CohortDefinition, settings: Settings) => (
  (settings[Setting.AttributeExperience] ? 1.0 + calculateExperienceReduction(settings, unit) : 1.0)
  * getValue(unit, UnitAttribute.DamageTaken, settings[Setting.AttributeDamage])
  / noZero(getValue(unit, UnitAttribute.Discipline, settings[Setting.AttributeDiscipline] === DisciplineValue.Both))
  / noZero(getMultiplier(unit, UnitAttribute.MilitaryTactics, settings[Setting.AttributeMilitaryTactics]))
)
