import { List, Map } from 'immutable'
import { BaseUnit, UnitCalc, UnitType, Units } from '../units'
import { TerrainCalc, TerrainDefinition } from '../terrains'
import { TacticDefinition, TacticCalc, TacticType } from '../tactics'
import { RowType, BaseUnits } from '../battle'
import { CombatParameter, Settings } from '../settings'
import { calculateValue, addValues, mergeValues, ValuesType } from '../../base_definition'
import { reinforce } from './reinforcement'
import { CountryName } from '../countries'

type Frontline = List<BaseUnit | undefined>
type Reserve = List<BaseUnit>
type Defeated = List<BaseUnit>

interface Loss {
  morale: number
  strength: number
}

interface Kill {
  morale: number
  strength: number
}

export interface ParticipantState {
  readonly country: CountryName
  readonly frontline: Frontline
  readonly reserve: Reserve
  readonly defeated: Defeated
  readonly tactic?: TacticDefinition
  readonly roll: number
  readonly general: number
  readonly row_types: Map<RowType, UnitType | undefined>
  readonly flank_size: number
}

/**
 * Makes given armies attach each other.
 * @param attacker Attackers.
 * @param defender Defenders.
 * @param round Turn number to distinguish different rounds.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 */
export const doBattle = (definitions: Units, attacker: ParticipantState, defender: ParticipantState, round: number, terrains: TerrainDefinition[], settings: Settings): [BaseUnits, BaseUnits] => {
  let a: BaseUnits = { frontline: attacker.frontline, reserve: attacker.reserve, defeated: attacker.defeated }
  let d: BaseUnits = { frontline: defender.frontline, reserve: defender.reserve, defeated: defender.defeated }
  // Simplifies later code because armies can be assumed to be the correct size.
  const combat_width = settings[CombatParameter.CombatWidth]

  a = removeOutOfBounds(a, combat_width)
  d = removeOutOfBounds(d, combat_width)
  a = removeDefeated(a)
  d = removeDefeated(d)
  a = reinforce(a, definitions[attacker.country], round, attacker.row_types, attacker.flank_size, calculateArmySize(d), settings, undefined)
  let definitions_a: Frontline = a.frontline.map(value => value && mergeValues(value, definitions[attacker.country][value.type]))
  if (settings[CombatParameter.ReinforceFirst])
    d = reinforce(d, definitions[defender.country], round, defender.row_types, defender.flank_size, calculateArmySize(a), settings, undefined)
  let a_to_d = pickTargets(definitions_a, d.frontline, !!settings[CombatParameter.FlankTargetsOwnEdge])
  if (!settings[CombatParameter.ReinforceFirst])
    d = reinforce(d, definitions[defender.country], round, defender.row_types, defender.flank_size, calculateArmySize(a), settings, a_to_d)
  let definitions_d: Frontline = d.frontline.map(value => value && mergeValues(value, definitions[defender.country][value.type]))
  let d_to_a = pickTargets(definitions_d, a.frontline, !!settings[CombatParameter.FlankTargetsOwnEdge])
  if (round < 1)
    return [a, d]

  const tactic_effects = {
    attacker: calculateTactic(attacker, attacker.tactic, defender.tactic && defender.tactic.type),
    defender: calculateTactic(defender, defender.tactic, attacker.tactic && attacker.tactic.type),
    casualties: calculateValue(attacker.tactic, TacticCalc.Casualties) + calculateValue(defender.tactic, TacticCalc.Casualties)
  }

  const attacker_roll = modifyRoll(attacker.roll, terrains, attacker.general, defender.general)
  const defender_roll = modifyRoll(defender.roll, [], defender.general, attacker.general)

  const [losses_d, kills_a] = attack(definitions_a, definitions_d, a_to_d, attacker_roll, terrains, tactic_effects.attacker, tactic_effects.casualties, settings)
  const [losses_a, kills_d] = attack(definitions_d, definitions_a, d_to_a, defender_roll, terrains, tactic_effects.defender, tactic_effects.casualties, settings)
  a = { frontline: applyLosses(a.frontline, losses_a, round), reserve: a.reserve, defeated: a.defeated }
  d = { frontline: applyLosses(d.frontline, losses_d, round), reserve: d.reserve, defeated: d.defeated }
  a = { frontline: applyKills(a.frontline, kills_a, round), reserve: a.reserve, defeated: a.defeated }
  d = { frontline: applyKills(d.frontline, kills_d, round), reserve: d.reserve, defeated: d.defeated }
  // Definitions contain the actual strength and morale values so they must be used to check defeated.
  definitions_a = applyLosses(definitions_a, losses_a, round)
  definitions_d = applyLosses(definitions_d, losses_d, round)
  a = saveTargets(a, a_to_d)
  d = saveTargets(d, d_to_a)
  const minimum_morale = settings[CombatParameter.MinimumMorale]
  const minimum_strength = settings[CombatParameter.MinimumStrength]
  a = copyDefeated(a, definitions_a, minimum_morale, minimum_strength)
  d = copyDefeated(d, definitions_d, minimum_morale, minimum_strength)
  if (a.frontline.findIndex(unit => !!(unit && !unit.is_defeated)) === -1 && a.reserve.count() === 0)
    a = removeDefeated(a)
  if (d.frontline.findIndex(unit => !!(unit && !unit.is_defeated)) === -1 && d.reserve.count() === 0)
    d = removeDefeated(d)
  return [a, d]
}

/**
 * Saves targeting information for display purposes.
 * @param army Frontline.
 * @param targets List of targets.
 */
const saveTargets = (army: BaseUnits, targets: Array<number | null>): BaseUnits => {
  const frontline = army.frontline.map((unit, index): (BaseUnit | undefined) => {
    if (!unit)
      return unit
    return { ...unit, target: targets[index]}
  })
  return { ...army, frontline }
}

/**
 * Removes units which are out of battlefield from a frontline.
 * Also resizes the frontline to prevent "index out of bounds" errors.
 * @param army Frontline and defeated.
 * @param combat_width Width of the battlefield.
 */
const removeOutOfBounds = (army: BaseUnits, combat_width: number): BaseUnits => {
  let defeated = army.defeated
  const frontline = army.frontline.map((unit, index) => {
    if (!unit)
      return unit
    if (index >= 0 && index < combat_width)
      return unit
    defeated = defeated.push(unit)
    return undefined
  }).setSize(combat_width)
  return { ...army, frontline, defeated }
}

/**
 * Selects targets for a given source_row from a given target_row.
 * Returns an array which maps attacker to defender.
 * @param source_row Attackers.
 * @param target_row Defenders.
 * @param flank_targets_near_own_edge Flanks pick targets near their edge.
 */
const pickTargets = (source_row: Frontline, target_row: Frontline, flank_targets_near_own_edge: boolean): Array<number | null> => {
  // Units attack mainly units on front of them. If not then first target from left to right.
  const attacker_to_defender = Array<number | null>(source_row.size)
  for (let i = 0; i < source_row.size; ++i)
    attacker_to_defender[i] = null
  source_row.forEach((source, source_index) => {
    if (!source)
      return
    let target_index: number | null = null
    if (target_row.get(source_index))
      target_index = source_index
    else {
      const maneuver = calculateValue(source, UnitCalc.Maneuver)
      if (flank_targets_near_own_edge && source_index > source_row.size / 2) {
        for (let index = source_index + maneuver; index >= source_index - maneuver; --index) {
          if (index >= 0 && index < source_row.size && target_row.get(index)) {
            target_index = index
            break
          }
        }
      }
      else {
        for (let index = source_index - maneuver; index <= source_index + maneuver; ++index) {
          if (index >= 0 && index < source_row.size && target_row.get(index)) {
            target_index = index
            break
          }
        }
      }
    }
    if (target_index === null)
      return
    attacker_to_defender[source_index] = target_index
  })
  return attacker_to_defender
}

/**
 * Calculates the roll modifier based on skill level difference of generals.
 * Every two levels increase dice roll by one (rounded down).
 */
export const calculateRollModifierFromGenerals = (skill: number, enemy_skill: number): number => Math.max(0, Math.floor((skill - enemy_skill) / 2.0))

/**
 * Calculates the roll modifier from terrains.
 */
export const calculateRollModifierFromTerrains = (terrains: TerrainDefinition[]): number => terrains.map(terrain => calculateValue(terrain, TerrainCalc.Roll)).reduce((previous, current) => previous + current, 0)

/**
 * Modifies a dice roll with terrains and general skill levels.
 * @param roll Initial dice roll.
 * @param terrains List of terrains in the battlefield.
 * @param general Skill level of own general.
 * @param opposing_general Skill level of the enemy general.
 */
const modifyRoll = (roll: number, terrains: TerrainDefinition[], general: number, opposing_general: number): number => {
  const modifier_terrain = calculateRollModifierFromTerrains(terrains)
  const modifier_effect = calculateRollModifierFromGenerals(general, opposing_general)
  return roll + modifier_terrain + modifier_effect
}

/**
 * Calculates amount of units in an army.
 * @param army Frontline, reserve and defeated.
 */
const calculateArmySize = (army: BaseUnits): number => army.frontline.reduce((previous, current) => previous + (current ? 1 : 0), 0) + army.reserve.size + army.defeated.size


/**
 * Calculates effectiveness of a tactic against another tactic with a given army.
 * @param frontline Units affecting the positive bonus.
 * @param tactic Tactic to calculate.
 * @param counter_tactic Opposing tactic, can counter or get countered.
 */
export const calculateTactic = (army?: BaseUnits, tactic?: TacticDefinition, counter_tactic?: TacticType): number => {
  const effectiveness = (tactic && counter_tactic) ? calculateValue(tactic, counter_tactic) : tactic ? 1.0 : 0.0
  let unit_modifier = 1.0
  if (effectiveness > 0 && tactic && army) {
    let units = 0
    let weight = 0.0
    for (const unit of List<BaseUnit |undefined>().concat(army.frontline).concat(army.reserve).concat(army.defeated)) {
      if (!unit)
        continue
      const strength = calculateValue(unit, UnitCalc.Strength)
      units += strength
      weight += calculateValue(tactic, unit.type) * strength
    }
    if (units)
      unit_modifier = weight / units
  }
  return effectiveness * Math.min(1.0, unit_modifier)
}

/**
 * Adds losses to a frontline, causing damage to the units.
 * @param frontline Frontline.
 * @param losses Losses added to units. 
 * @param round Turn number to separate losses caused by other rounds.
 */
const applyLosses = (frontline: Frontline, losses: Loss[], round: number): Frontline => {
  return frontline.map((unit, index) => {
    const loss_values: [UnitCalc, number][] = [[UnitCalc.Morale, losses[index].morale], [UnitCalc.Strength, losses[index].strength]]
    return unit && addValues(unit, ValuesType.Loss, 'Round ' + round, loss_values)
  })
}

/**
 * Adds kills to a frontline, for statistical purposes.
 * @param frontline Frontline.
 * @param kills Kill counts added to units.
 * @param round Turn number to seprate kills caused by other rounds.
 */
const applyKills = (frontline: Frontline, kills: Kill[], round: number): Frontline => {
  return frontline.map((unit, index) => {
    const kill_values: [UnitCalc, number][] = [[UnitCalc.MoraleDepleted, kills[index].morale], [UnitCalc.StrengthDepleted, kills[index].strength]]
    return unit && addValues(unit, ValuesType.Base, 'Round ' + round, kill_values)
  })
}

/**
 * Removes defeated units from a frontline.
 * @param army Frontline. 
 */
const removeDefeated = (army: BaseUnits): BaseUnits => {
  const frontline = army.frontline.map(unit => unit && !unit.is_defeated ? unit : undefined)
  return { frontline, reserve: army.reserve, defeated: army.defeated }
}

/**
 * Copies defeated units from a frontline to defeated.
 * Units on the frontline will be marked as defeated for visual purposes.
 * @param army Frontline and defeated.
 * @param definitions Full definitions for units in the frontline. Needed to check when defeated.
 * @param minimum_morale Minimum morale to stay in the fight.
 * @param minimum_strength Minimum strength to stay in the fight.
 */
const copyDefeated = (army: BaseUnits, definitions: Frontline, minimum_morale: number, minimum_strength: number): BaseUnits => {
  let defeated = army.defeated
  const frontline = army.frontline.map((unit, index) => {
    const definition = definitions.get(index)
    if (!definition || !unit)
      return undefined
    if (calculateValue(definition, UnitCalc.Strength) > minimum_strength && calculateValue(definition, UnitCalc.Morale) > minimum_morale)
      return unit
    defeated = defeated.push(unit)
    return { ...unit, is_defeated: true }
  })
  return { frontline, reserve: army.reserve, defeated }
}

/**
 * Calculates losses when a given source row attacks a given target row.
 * @param source_row A row of attackers inflicting daamge on target_row.
 * @param target_row A row of defenders receiving damage from source_row.
 * @param source_to_target Selected targets for attackers.
 * @param roll Dice roll, affects amount of damage inflicted.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 * @param tactic_damage_multiplier Multiplier for damage from tactics.
 * @param casualties_multiplier Multiplier for strength lost from tactics.
 * @param settings Combat parameters.
 */
const attack = (source_row: Frontline, target_row: Frontline, source_to_target: (number | null)[], roll: number, terrains: TerrainDefinition[], tactic_damage_multiplier: number, casualties_multiplier: number, settings: Settings): [Loss[], Kill[]] => {
  const target_losses = Array<Loss>(target_row.size)
  for (let i = 0; i < target_row.size; ++i)
    target_losses[i] = { morale: 0, strength: 0 }
  const source_kills = Array<Kill>(source_row.size)
  for (let i = 0; i < source_row.size; ++i)
    source_kills[i] = { morale: 0, strength: 0 }
  source_row.forEach((source, source_index) => {
    const target_index = source_to_target[source_index]
    if (!source || target_index === null)
      return
    const target = target_row.get(target_index)!
    const losses = calculateLosses(source, target, roll, terrains, tactic_damage_multiplier, casualties_multiplier, settings)
    target_losses[target_index].strength += losses.strength
    target_losses[target_index].morale += losses.morale
    source_kills[source_index].strength += losses.strength
    source_kills[source_index].morale += losses.morale
  })
  return [target_losses, source_kills]
}

/**
 * Calculates the base damage value from roll.
 * @param roll Dice roll with modifiers.
 * @param settings Combat parameters.
 */
export const calculateBaseDamage = (roll: number, settings: Settings): number => {
  const base_damage = settings[CombatParameter.BaseDamage]
  const roll_damage = settings[CombatParameter.RollDamage]
  const max_damage = settings[CombatParameter.MaxBaseDamage]
  return Math.min(max_damage, base_damage + roll_damage * roll)
}

/**
 * Calculates both strength and morale losses caused by a given attacker to a given defender.
 * Experimental: Tested with unit tests from in-game results. Not 100% accurate.
 * @param source An attacker inflicting damange on the target.
 * @param target A defender receiving damage from the source.
 * @param roll Dice roll, affects amount of damage inflicted.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 * @param tactic_damage_multiplier Multiplier for damage from tactics.
 * @param casualties_multiplier Multiplier for strength lost from tactics.
 * @param settings Combat parameters.
 */
const calculateLosses = (source: BaseUnit, target: BaseUnit, roll: number, terrains: TerrainDefinition[], tactic_damage_multiplier: number, casualties_multiplier: number, settings: Settings): Loss => {
  let damage_reduction_per_experience = settings[CombatParameter.ExperienceDamageReduction]
  // Bug in game which makes morale damage taken and strength damage taken affect damage reduction from experience.
  if (!settings[CombatParameter.FixExperience])
    damage_reduction_per_experience *= (2.0 + calculateValue(target, UnitCalc.MoraleDamageTaken) + calculateValue(target, UnitCalc.StrengthDamageTaken)) * 0.5
  const strength_lost_multiplier = settings[CombatParameter.StrengthLostMultiplier]
  const morale_lost_multiplier = settings[CombatParameter.MoraleLostMultiplier]
  const morale_base_damage = settings[CombatParameter.MoraleDamageBase]
  let damage = 100000.0 * calculateBaseDamage(roll, settings)
  damage = calculate(damage, 1.0 + calculateValue(source, UnitCalc.Discipline))
  damage = calculate(damage, 1.0 + calculateValue(source, UnitCalc.DamageDone))
  if (settings[CombatParameter.FixDamageTaken])
    damage = calculate(damage, 1.0 + calculateValue(target, UnitCalc.DamageTaken))
  else
    damage = calculate(damage, 1.0 + calculateValue(source, UnitCalc.DamageDone))
  damage = calculate(damage, 1.0 + terrains.reduce((previous, current) => previous + (current ? calculateValue(source, current.type) : 0), 0))
  damage = calculate(damage, 1.0 + calculateValue(source, target.type))
  damage = calculate(damage, 1.0 + tactic_damage_multiplier)
  damage = calculate(damage, 1.0 + calculateValue(source, UnitCalc.Offense) - calculateValue(target, UnitCalc.Defense))
  damage = calculate(damage, 1.0 - damage_reduction_per_experience * calculateValue(target, UnitCalc.Experience))
  damage = calculate(damage, calculateValue(source, UnitCalc.Strength))
  let strength_lost = damage
  strength_lost = calculate(strength_lost, 1.0 + casualties_multiplier)
  strength_lost = calculate(strength_lost, strength_lost_multiplier)
  strength_lost = calculate(strength_lost, 1.0 + calculateValue(source, UnitCalc.StrengthDamageDone))
  strength_lost = calculate(strength_lost, 1.0 + calculateValue(target, UnitCalc.StrengthDamageTaken))
  let morale_lost = damage
  morale_lost = calculate(morale_lost, Math.max(0, calculateValue(source, UnitCalc.Morale)) / morale_base_damage)
  morale_lost = calculate(morale_lost, morale_lost_multiplier)
  morale_lost = calculate(morale_lost, 1.0 + calculateValue(source, UnitCalc.MoraleDamageDone))
  morale_lost = calculate(morale_lost, 1.0 + calculateValue(target, UnitCalc.MoraleDamageTaken))
  return { strength: strength_lost / 100000.0, morale: morale_lost / 100000.0 }
}

/**
 * Similar rounding formula like in the game.
 */
const calculate = (value1: number, value2: number) => Math.floor(value1 * value2)
