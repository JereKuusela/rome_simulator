
import { sumBy, values } from 'lodash'
import { TerrainDefinition, UnitType, Cohort, UnitAttribute, Setting, Settings, CombatPhase, UnitValueType, CombatCohort, CombatCohortCalculated, CombatCohortDefinition, DisciplineValue } from 'types'
import { toObj, map, noZero } from 'utils'
import { calculateValue, calculateValueWithoutLoss, calculateBase } from 'definition_values'
import { calculateExperienceReduction } from './combat_utils'

export const getUnitDefinition = (combatSettings: Settings, terrains: TerrainDefinition[], unit_types: UnitType[], cohort: Cohort): CombatCohortDefinition => {
  const info = {
    id: cohort.id,
    type: cohort.type,
    is_loyal: !!cohort.is_loyal,
    image: cohort.image,
    max_morale: calculateValueWithoutLoss(cohort, UnitAttribute.Morale),
    max_strength: calculateValueWithoutLoss(cohort, UnitAttribute.Strength),
    experience_reduction: calculateExperienceReduction(combatSettings, cohort),
    // Unmodified value is used to determine deployment order.
    deployment_cost: calculateBase(cohort, UnitAttribute.Cost),
    tech: cohort.tech,
    mode: cohort.mode,
    role: cohort.role,
    parent: cohort.parent
  } as CombatCohortDefinition
  values(UnitAttribute).forEach(calc => { info[calc] = calculateValue(cohort, calc) })
  values(CombatPhase).forEach(calc => { info[calc] = calculateValue(cohort, calc) })
  terrains.forEach(({ type }) => { info[type] = calculateValue(cohort, type) })
  unit_types.forEach(calc => { info[calc] = calculateValue(cohort, calc) })
  return info
}

/**
 * Transforms a unit to a combat unit.
 */
export const getCombatUnit = (combatSettings: Settings, casualties_multiplier: number, terrains: TerrainDefinition[], unit_types: UnitType[], cohort: Cohort | null): CombatCohort | null => {
  if (!cohort)
    return null
  const combat_unit: CombatCohort = {
    [UnitAttribute.Morale]: calculateValue(cohort, UnitAttribute.Morale),
    [UnitAttribute.Strength]: calculateValue(cohort, UnitAttribute.Strength),
    calculated: precalculateUnit(combatSettings, casualties_multiplier, terrains, unit_types, cohort),
    state: { target: null, target_support: null, flanking: false, morale_loss: 0, strength_loss: 0, morale_dealt: 0, strength_dealt: 0, damage_multiplier: 0, is_defeated: false, is_destroyed: false, total_morale_dealt: 0, total_strength_dealt: 0 },
    definition: getUnitDefinition(combatSettings, terrains, unit_types, cohort),
    is_weak: false
  }
  return combat_unit
}

const applyPhaseDamageDone = (unit: Cohort, value: number) => ({
  [CombatPhase.Default]: value,
  [CombatPhase.Fire]: value * (1.0 + calculateValue(unit, UnitAttribute.FireDamageDone)),
  [CombatPhase.Shock]: value * (1.0 + calculateValue(unit, UnitAttribute.ShockDamageDone))
})

const applyPhaseDamageTaken = (unit: Cohort, value: number) => ({
  [CombatPhase.Default]: value,
  [CombatPhase.Fire]: value * (1.0 + calculateValue(unit, UnitAttribute.FireDamageTaken)),
  [CombatPhase.Shock]: value * (1.0 + calculateValue(unit, UnitAttribute.ShockDamageTaken))
})

const applyPhaseDamage = (unit: Cohort, value: number) => ({
  [CombatPhase.Default]: value,
  [CombatPhase.Fire]: value * calculateValue(unit, CombatPhase.Fire),
  [CombatPhase.Shock]: value * calculateValue(unit, CombatPhase.Shock)
})

const applyUnitTypes = (unit: Cohort, unit_types: UnitType[], settings: Settings, values: { [key in CombatPhase]: number }) => (
  toObj(unit_types, type => type, type => map(values, damage => damage * getValue(unit, type, settings[Setting.AttributeUnitType])))
)

const applyDamageTypes = (unit: Cohort, settings: Settings, casualties_multiplier: number, values: { [key in UnitType]: { [key in CombatPhase]: number } }) => {
  const morale_done = getValue(unit, UnitAttribute.MoraleDamageDone, settings[Setting.AttributeMoraleDamage]) * settings[Setting.MoraleLostMultiplier] / 1000.0
  const strength_done = applyPhaseDamageDone(unit, getValue(unit, UnitAttribute.StrengthDamageDone, settings[Setting.AttributeStrengthDamage]) * settings[Setting.StrengthLostMultiplier] * (1.0 + casualties_multiplier) / 1000.0)
  return {
    [UnitAttribute.Strength]: map(values, values => map(values, (value, phase) => value * strength_done[phase])),
    [UnitAttribute.Morale]: map(values, values => map(values, value => value * morale_done)),
    'Damage': values
  }
}

const getDamages = (settings: Settings, casualties_multiplier: number, terrains: TerrainDefinition[], unit_types: UnitType[], cohort: Cohort) => (
  applyDamageTypes(cohort, settings, casualties_multiplier, applyUnitTypes(cohort, unit_types, settings, applyPhaseDamage(cohort, precalculateDamage(terrains, cohort, settings))))
)

/**
 * Returns a precalculated info about a given unit.
 */
const precalculateUnit = (settings: Settings, casualties_multiplier: number, terrains: TerrainDefinition[], unit_types: UnitType[], cohort: Cohort) => {
  const damage_reduction = precalculateDamageReduction(cohort, settings)
  const info: CombatCohortCalculated = {
    damage: getDamages(settings, casualties_multiplier, terrains, unit_types, cohort),
    damage_taken_multiplier: damage_reduction,
    morale_taken_multiplier: damage_reduction * getValue(cohort, UnitAttribute.MoraleDamageTaken, settings[Setting.AttributeMoraleDamage]),
    strength_taken_multiplier: applyPhaseDamageTaken(cohort, damage_reduction * getValue(cohort, UnitAttribute.StrengthDamageTaken, settings[Setting.AttributeStrengthDamage]))
  }
  return info
}

const getValue = (unit: Cohort, attribute: UnitValueType, enabled: boolean) => 1.0 + getMultiplier(unit, attribute, enabled)
const getMultiplier = (unit: Cohort, attribute: UnitValueType, enabled: boolean) => enabled ? calculateValue(unit, attribute) : 0

const precalculateDamage = (terrains: TerrainDefinition[], unit: Cohort, settings: Settings) => (
  settings[Setting.Precision]
  * getValue(unit, UnitAttribute.Discipline, settings[Setting.AttributeDiscipline] === DisciplineValue.Both || settings[Setting.AttributeDiscipline] === DisciplineValue.Damage)
  * getValue(unit, UnitAttribute.CombatAbility, settings[Setting.AttributeCombatAbility])
  * getValue(unit, UnitAttribute.DamageDone, settings[Setting.AttributeDamage])
  * (1.0 + sumBy(terrains, terrain => getMultiplier(unit, terrain.type, settings[Setting.AttributeTerrainType])))
  * (settings[Setting.AttributeLoyal] && unit.is_loyal ? 1.1 : 1.0)
)

const precalculateDamageReduction = (unit: Cohort, settings: Settings) => (
  (settings[Setting.AttributeExperience] ? 1.0 + calculateExperienceReduction(settings, unit) : 1.0)
  * getValue(unit, UnitAttribute.DamageTaken, settings[Setting.AttributeDamage])
  / noZero(getValue(unit, UnitAttribute.Discipline, settings[Setting.AttributeDiscipline] === DisciplineValue.Both))
  / noZero(getMultiplier(unit, UnitAttribute.MilitaryTactics, settings[Setting.AttributeMilitaryTactics]))
)
