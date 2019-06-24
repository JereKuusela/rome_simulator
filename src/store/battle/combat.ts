import { List, Map } from 'immutable'
import { Unit, UnitDefinition, UnitCalc, UnitType, ArmyName } from '../units'
import { TerrainDefinition, TerrainCalc } from '../terrains'
import { TacticDefinition, TacticCalc, TacticType } from '../tactics'
import { RowType, Army } from '../land_battle'
import { CombatParameter } from '../settings'
import { calculateValue, addValues, mergeValues, ValuesType } from '../../base_definition'
import { reinforce } from './reinforcement'

type Frontline = List<Unit | undefined>
type Reserve = List<Unit>
type Defeated = List<Unit>
type Terrains = List<TerrainDefinition | undefined>
type Definition = Map<UnitType, UnitDefinition>
type Definitions = Map<ArmyName, Definition>
type Settings = Map<CombatParameter, number>

interface Loss {
  morale: number
  manpower: number
}

interface Kill {
  morale: number
  manpower: number
}

export interface ParticipantState {
  readonly name: ArmyName
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
export const battle = (definitions: Definitions, attacker: ParticipantState, defender: ParticipantState, round: number, terrains: Terrains, settings: Settings): [Army, Army] => {
  let a: Army = { frontline: attacker.frontline, reserve: attacker.reserve, defeated: attacker.defeated }
  let d: Army = { frontline: defender.frontline, reserve: defender.reserve, defeated: defender.defeated }
  // Simplifies later code because armies can be assumed to be the correct size.
  const combat_width = settings.get(CombatParameter.CombatWidth) || 30

  a = removeOutOfBounds(a, combat_width)
  d = removeOutOfBounds(d, combat_width)
  a = removeDefeated(a)
  d = removeDefeated(d)
  a = reinforce(a, definitions.get(attacker.name)!, round, attacker.row_types, attacker.flank_size, calculateArmySize(d), undefined)
  let definitions_a: Frontline = a.frontline.map(value => value && mergeValues(value, definitions.getIn([attacker.name, value.type])))
  if (settings.get(CombatParameter.ReinforceFirst))
    d = reinforce(d, definitions.get(defender.name)!, round, defender.row_types, defender.flank_size, calculateArmySize(a), undefined)
  let a_to_d = pickTargets(definitions_a, d.frontline, !!settings.get(CombatParameter.FlankTargetsOwnEdge))
  if (!settings.get(CombatParameter.ReinforceFirst))
    d = reinforce(d, definitions.get(defender.name)!, round, defender.row_types, defender.flank_size, calculateArmySize(a), a_to_d)
  let definitions_d: Frontline = d.frontline.map(value => value && mergeValues(value, definitions.getIn([defender.name, value.type])))
  let d_to_a = pickTargets(definitions_d, a.frontline, !!settings.get(CombatParameter.FlankTargetsOwnEdge))
  if (round < 1)
    return [a, d]

  const tactic_effects = {
    attacker: calculateTactic(attacker.frontline, attacker.tactic, defender.tactic && defender.tactic.type),
    defender: calculateTactic(defender.frontline, defender.tactic, attacker.tactic && attacker.tactic.type),
    casualties: calculateValue(attacker.tactic, TacticCalc.Casualties) + calculateValue(defender.tactic, TacticCalc.Casualties)
  }

  const attacker_roll = modifyRoll(attacker.roll, terrains, attacker.general, defender.general)
  const defender_roll = modifyRoll(defender.roll, List(), defender.general, attacker.general)

  const [losses_d, kills_a] = attack(definitions_a, definitions_d, a_to_d, attacker_roll, terrains, tactic_effects.attacker, tactic_effects.casualties, settings)
  const [losses_a, kills_d] = attack(definitions_d, definitions_a, d_to_a, defender_roll, terrains, tactic_effects.defender, tactic_effects.casualties, settings)
  a = { frontline: applyLosses(a.frontline, losses_a, round), reserve: a.reserve, defeated: a.defeated }
  d = { frontline: applyLosses(d.frontline, losses_d, round), reserve: d.reserve, defeated: d.defeated }
  a = { frontline: applyKills(a.frontline, kills_a, round), reserve: a.reserve, defeated: a.defeated }
  d = { frontline: applyKills(d.frontline, kills_d, round), reserve: d.reserve, defeated: d.defeated }
  // Definitions contain the actual manpower and morale values so they must be used to check defeated.
  definitions_a = applyLosses(definitions_a, losses_a, round)
  definitions_d = applyLosses(definitions_d, losses_d, round)
  a = saveTargets(a, a_to_d)
  d = saveTargets(d, d_to_a)
  const minimum_morale = settings.get(CombatParameter.MinimumMorale) || 0.25
  const minimum_manpower = settings.get(CombatParameter.MinimumStrength) || 0
  a = copyDefeated(a, definitions_a, minimum_morale, minimum_manpower)
  d = copyDefeated(d, definitions_d, minimum_morale, minimum_manpower)
  if (a.frontline.findIndex(unit => !!(unit && !unit.is_defeated)) === -1)
    a = removeDefeated(a)
  if (d.frontline.findIndex(unit => !!(unit && !unit.is_defeated)) === -1)
    d = removeDefeated(d)
  return [a, d]
}

/**
 * Saves targeting information for display purposes.
 * @param army Frontline.
 * @param targets List of targets.
 */
const saveTargets = (army: Army, targets: Array<number | null>): Army => {
  const frontline = army.frontline.map((unit, index): (Unit | undefined) => {
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
const removeOutOfBounds = (army: Army, combat_width: number): Army => {
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
export const calculateRollModifierFromTerrains = (terrains: Terrains): number => terrains.map(terrain => calculateValue(terrain, TerrainCalc.Roll)).reduce((previous, current) => previous + current, 0)

/**
 * Modifies a dice roll with terrains and general skill levels.
 * @param roll Initial dice roll.
 * @param terrains List of terrains in the battlefield.
 * @param general Skill level of own general.
 * @param opposing_general Skill level of the enemy general.
 */
const modifyRoll = (roll: number, terrains: Terrains, general: number, opposing_general: number): number => {
  const modifier_terrain = calculateRollModifierFromTerrains(terrains)
  const modifier_effect = calculateRollModifierFromGenerals(general, opposing_general)
  return roll + modifier_terrain + modifier_effect
}

/**
 * Calculates amount of units in an army.
 * @param army Frontline, reserve and defeated.
 */
const calculateArmySize = (army: Army): number => army.frontline.reduce((previous, current) => previous + (current ? 1 : 0), 0) + army.reserve.size + army.defeated.size


/**
 * Calculates effectiveness of a tactic against another tactic with a given army.
 * @param frontline Units affecting the positive bonus.
 * @param tactic Tactic to calculate.
 * @param counter_tactic Opposing tactic, can counter or get countered.
 */
export const calculateTactic = (frontline?: Frontline, tactic?: TacticDefinition, counter_tactic?: TacticType): number => {
  const effectiveness = (tactic && counter_tactic) ? calculateValue(tactic, counter_tactic) : tactic ? 1.0 : 0.0
  let unit_modifier = 1.0
  if (effectiveness > 0 && tactic && frontline) {
    let units = 0
    let weight = 0.0
    for (const unit of frontline) {
      if (!unit)
        continue
      units += 1
      weight += calculateValue(tactic, unit.type)
    }
    if (units)
      unit_modifier = weight / units
  }
  return 1.0 + effectiveness * Math.min(1.0, unit_modifier)
}

/**
 * Adds losses to a frontline, causing damage to the units.
 * @param frontline Frontline.
 * @param losses Losses added to units. 
 * @param round Turn number to separate losses caused by other rounds.
 */
const applyLosses = (frontline: Frontline, losses: Loss[], round: number): Frontline => {
  return frontline.map((unit, index) => {
    const loss_values: [UnitCalc, number][] = [[UnitCalc.Morale, losses[index].morale], [UnitCalc.Manpower, losses[index].manpower]]
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
    const kill_values: [UnitCalc, number][] = [[UnitCalc.MoraleDepleted, kills[index].morale], [UnitCalc.ManpowerDepleted, kills[index].manpower]]
    return unit && addValues(unit, ValuesType.Base, 'Round ' + round, kill_values)
  })
}

/**
 * Removes defeated units from a frontline.
 * @param army Frontline. 
 */
const removeDefeated = (army: Army): Army => {
  const frontline = army.frontline.map(unit => unit && !unit.is_defeated ? unit : undefined)
  return { frontline, reserve: army.reserve, defeated: army.defeated }
}

/**
 * Copies defeated units from a frontline to defeated.
 * Units on the frontline will be marked as defeated for visual purposes.
 * @param army Frontline and defeated.
 * @param definitions Full definitions for units in the frontline. Needed to check when defeated.
 * @param minimum_morale Minimum morale to stay in the fight.
 * @param minimum_manpower Minimum manpower to stay in the fight.
 */
const copyDefeated = (army: Army, definitions: Frontline, minimum_morale: number, minimum_manpower: number): Army => {
  let defeated = army.defeated
  const frontline = army.frontline.map((unit, index) => {
    const definition = definitions.get(index)
    if (!definition || !unit)
      return undefined
    if (calculateValue(definition, UnitCalc.Manpower) > minimum_manpower && calculateValue(definition, UnitCalc.Morale) > minimum_morale)
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
 * @param casualties_multiplier Multiplier for manpower lost from tactics.
 * @param settings Combat parameters.
 */
const attack = (source_row: Frontline, target_row: Frontline, source_to_target: (number | null)[], roll: number, terrains: Terrains, tactic_damage_multiplier: number, casualties_multiplier: number, settings: Settings): [Loss[], Kill[]] => {
  const target_losses = Array<Loss>(target_row.size)
  for (let i = 0; i < target_row.size; ++i)
    target_losses[i] = { morale: 0, manpower: 0 }
  const source_kills = Array<Kill>(source_row.size)
  for (let i = 0; i < source_row.size; ++i)
    source_kills[i] = { morale: 0, manpower: 0 }
  source_row.forEach((source, source_index) => {
    const target_index = source_to_target[source_index]
    if (!source || target_index === null)
      return
    const target = target_row.get(target_index)!
    const losses = calculateLosses(source, target, roll, terrains, tactic_damage_multiplier, casualties_multiplier, settings)
    target_losses[target_index].manpower += losses.manpower
    target_losses[target_index].morale += losses.morale
    source_kills[source_index].manpower += losses.manpower
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
  const base_damage = settings.get(CombatParameter.BaseDamage) || 0.08
  const roll_damage = settings.get(CombatParameter.RollDamage) || 0.02
  return base_damage + roll_damage * roll
}

/**
 * Calculates both manpower and morale losses caused by a given attacker to a given defender.
 * Experimental: Tested with unit tests from in-game results. Not 100% accurate.
 * @param source An attacker inflicting damange on the target.
 * @param target A defender receiving damage from the source.
 * @param roll Dice roll, affects amount of damage inflicted.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 * @param tactic_damage_multiplier Multiplier for damage from tactics.
 * @param casualties_multiplier Multiplier for manpower lost from tactics.
 * @param settings Combat parameters.
 */
const calculateLosses = (source: Unit, target: Unit, roll: number, terrains: Terrains, tactic_damage_multiplier: number, casualties_multiplier: number, settings: Settings): Loss => {
  const damage_reduction_per_experience = settings.get(CombatParameter.ExperienceDamageReduction) || 0.3
  const manpower_lost_multiplier = settings.get(CombatParameter.StrengthLostMultiplier) || 0.2
  const morale_lost_multiplier = settings.get(CombatParameter.MoraleLostMultiplier) || 1.5
  const morale_base_damage = settings.get(CombatParameter.MoraleDamageBase) || 2.0
  let damage = calculateBaseDamage(roll, settings)
  damage = damage
    * (1.0 + calculateValue(source, UnitCalc.Offense))
    * (1.0 + calculateValue(source, UnitCalc.Discipline))
    * (1.0 + calculateValue(source, target.type))
    * tactic_damage_multiplier
    * (1.0 + terrains.map(terrain => terrain ? calculateValue(source, terrain.type) : 0).reduce((previous, current) => previous + current, 0))
    / (1.0 + calculateValue(target, UnitCalc.Defense))
    * (1.0 - damage_reduction_per_experience * calculateValue(target, UnitCalc.Experience))
  damage = Math.floor(damage * calculateValue(source, UnitCalc.Manpower))
  const manpower_lost = damage * manpower_lost_multiplier * (1.0 + casualties_multiplier) * (1.0 + calculateValue(target, UnitCalc.StrengthDamageTaken)) * (1.0 + calculateValue(source, UnitCalc.StrengthDamageDone))
  const morale_multiplier = Math.floor(1000.0 * Math.max(0, calculateValue(source, UnitCalc.Morale)) / morale_base_damage) / 1000.0
  let morale_lost = Math.floor(Math.floor(damage * morale_multiplier) * morale_lost_multiplier)
  morale_lost = morale_lost + Math.floor(morale_lost * calculateValue(source, UnitCalc.MoraleDamageDone))
  morale_lost = morale_lost + Math.floor(morale_lost * calculateValue(target, UnitCalc.MoraleDamageTaken))
  return { manpower: Math.floor(manpower_lost), morale: morale_lost / 1000.0 }
}
