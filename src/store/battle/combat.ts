import { List, Map } from 'immutable'
import { Unit, UnitDefinition, UnitCalc, UnitType, ArmyName } from '../units'
import { TerrainDefinition, TerrainCalc } from '../terrains'
import { TacticDefinition, TacticCalc } from '../tactics'
import { RowType, Armies } from '../land_battle'
import { CombatParameter } from '../settings'
import { calculateValue, addValues, mergeValues, ValuesType } from '../../base_definition'

type Army = List<Unit | undefined>
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
  readonly army: Army
  readonly reserve: Reserve
  readonly defeated: Defeated
  readonly tactic?: TacticDefinition
  readonly roll: number
  readonly general: number
  readonly row_types: Map<RowType, UnitType>
  readonly flank_size: number
}

/**
 * Makes given armies attach each other.
 * @param attacker Attackers.
 * @param defender Defenders.
 * @param round Turn number to distinguish different rounds.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 */
export const battle = (definitions: Definitions, attacker: ParticipantState, defender: ParticipantState, round: number, terrains: Terrains, settings: Settings): [Armies, Armies] => {
  let a: Armies = { army: attacker.army, reserve: attacker.reserve, defeated: attacker.defeated }
  let d: Armies = { army: defender.army, reserve: defender.reserve, defeated: defender.defeated }
  // Simplifies later code because armies can be assumed to be the correct size.
  const combat_width = settings.get(CombatParameter.CombatWidth) || 30

  a = removeOutOfBounds(a, combat_width)
  d = removeOutOfBounds(d, combat_width)
  a = removeDefeated(a)
  d = removeDefeated(d)
  a = reinforce(a, definitions.get(attacker.name)!, round, attacker.row_types, attacker.flank_size, countArmySize(d), undefined)
  let definitions_a: Army = a.army.map(value => value && mergeValues(value, definitions.getIn([ArmyName.Attacker, value.type])))
  if (settings.get(CombatParameter.ReinforceFirst))
    d = reinforce(d, definitions.get(defender.name)!, round, defender.row_types, defender.flank_size, countArmySize(a), undefined)
  let a_to_d = pickTargets(definitions_a, d.army, !!settings.get(CombatParameter.FlankTargetsOwnEdge))
  if (!settings.get(CombatParameter.ReinforceFirst))
    d = reinforce(d, definitions.get(defender.name)!, round, defender.row_types, defender.flank_size, countArmySize(a), a_to_d)
  let definitions_d: Army = d.army.map(value => value && mergeValues(value, definitions.getIn([ArmyName.Defender, value.type])))
  let d_to_a = pickTargets(definitions_d, a.army, !!settings.get(CombatParameter.FlankTargetsOwnEdge))
  if (round < 1)
    return [a, d]

  const tactic_effects = {
    attacker: calculateTactic(attacker.army, attacker.tactic, defender.tactic),
    defender: calculateTactic(defender.army, defender.tactic, attacker.tactic),
    casualties: calculateValue(attacker.tactic, TacticCalc.Casualties) + calculateValue(defender.tactic, TacticCalc.Casualties)
  }

  const attacker_roll = modifyRoll(attacker.roll, terrains, attacker.general, defender.general)
  const defender_roll = modifyRoll(defender.roll, List(), defender.general, attacker.general)

  //console.log('Rolls: A ' + attacker_roll + ' D ' + defender_roll)

  let [losses_d, kills_a] = attack(definitions_a, definitions_d, a_to_d, attacker_roll, terrains, tactic_effects.attacker, tactic_effects.casualties, settings)
  let [losses_a, kills_d] = attack(definitions_d, definitions_a, d_to_a, defender_roll, terrains, tactic_effects.defender, tactic_effects.casualties, settings)
  a = { army: applyLosses(a.army, losses_a, round), reserve: a.reserve, defeated: a.defeated }
  d = { army: applyLosses(d.army, losses_d, round), reserve: d.reserve, defeated: d.defeated }
  a = { army: applyKills(a.army, kills_a, round), reserve: a.reserve, defeated: a.defeated }
  d = { army: applyKills(d.army, kills_d, round), reserve: d.reserve, defeated: d.defeated }
  // Definition contain the actual manpower and morale values so they must be used to check defeated.
  definitions_a = applyLosses(definitions_a, losses_a, round)
  definitions_d = applyLosses(definitions_d, losses_d, round)
  const minimum_morale = settings.get(CombatParameter.MinimumMorale) || 0.25
  const minimum_manpower = settings.get(CombatParameter.MinimumManpower) || 0
  a = copyDefeated(a, definitions_a, minimum_morale, minimum_manpower)
  d = copyDefeated(d, definitions_d, minimum_morale, minimum_manpower)
  if (a.army.findIndex(unit => !!(unit && !unit.is_defeated)) === -1)
    a = removeDefeated(a)
  if (d.army.findIndex(unit => !!(unit && !unit.is_defeated)) === -1)
    d = removeDefeated(d)
  return [a, d]
}

const removeOutOfBounds = (armies: Armies, combat_width: number): Armies => {
  let defeated = armies.defeated
  const army = armies.army.map((unit, index) => {
    if (!unit)
      return unit
    if (index >= 0 && index < combat_width)
      return unit
    defeated = defeated.push(unit)
    return undefined
  }).setSize(combat_width)
  return { army, reserve: armies.reserve, defeated }
}

export const calculateGeneralEffect = (general: number, opposing_general: number): number => Math.max(0, Math.floor((general - opposing_general) / 2.0))
export const calculateTerrainEffect = (terrains: Terrains): number => terrains.map(terrain => calculateValue(terrain, TerrainCalc.Roll)).reduce((previous, current) => previous + current, 0)

const modifyRoll = (roll: number, terrains: Terrains, general: number, opposing_general: number): number => {
  const terrain_effect = calculateTerrainEffect(terrains)
  const general_effect = calculateGeneralEffect(general, opposing_general)
  return roll + terrain_effect + general_effect
}

const countArmySize = (armies: Armies): number => armies.army.reduce((previous, current) => previous + (current ? 1 : 0), 0) + armies.reserve.size + armies.defeated.size


/**
 * Reinforces a given army based on reinforcement rules.
 * First priority is to move units from backlines. Then from sides.
 * @param round Round number affects whether initial deployment or reinforcing is used.
 * @param army Army to reinforce.
 * @param reserve Reserve which reinforces army.
 * @param row_types Preferred unit types.
 * @param flank_size Size of flank.
 * @param enemy_size Army size of the enemy
 * @param attacker_to_defender Selected targets as reinforcement may move units.
 */
const reinforce = (armies: Armies, definitions: Definition, round: number, row_types: Map<RowType, UnitType>, flank_size: number, enemy_size: number, attacker_to_defender: (number | null)[] | undefined): Armies => {
  // 1: Empty spots get filled by back row.
  // 2: If still holes, units move towards center.
  // Backrow.
  let army = armies.army
  let reserve = armies.reserve

  const half = Math.floor(army.size / 2.0)

  const nextIndex = (index: number) => index < half ? index + 2 * (half - index) : index - 2 * (index - half) - 1

  const isFlankUnit = (unit: Unit) => {
    if (unit.type === row_types.get(RowType.Flank))
      return true
    if (unit.type === row_types.get(RowType.Front) || unit.type === row_types.get(RowType.Back))
      return false
    return calculateValue(unit, UnitCalc.Maneuver) > 2
  }

  const mainReserve = reserve.filter(value => !isFlankUnit(mergeValues(value, definitions.get(value.type)!)))
  const flankReserve = reserve.filter(value => isFlankUnit(mergeValues(value, definitions.get(value.type)!)))
  let orderedMainReserve = mainReserve.sortBy((value, key) => {
    value = mergeValues(value, definitions.get(value.type)!)
    return -calculateValue(value, UnitCalc.Cost) * 10000 + key - (value.type === row_types.get(RowType.Front) ? 2000000 : 0) - (value.type === row_types.get(RowType.Back) ? -1000000 : 0)
  })
  let orderedFlankReserve = flankReserve.sortBy((value, key) => {
    value = mergeValues(value, definitions.get(value.type)!)
    return -calculateValue(value, UnitCalc.Maneuver) * 10000 + key - (value.type === row_types.get(RowType.Flank) ? 1000000 : 0)
  })
  // Algo 2.0
  /*
  1: Calculate flank (preference (if 33 stacks) or unit count difference, whichever higher)
  2: Check preferences to calculate order.
  3: Fill front (main + flankers)
  4: Fill flankers

  Front: Moves unit to start of main group, removes from flankers
  Back: Moves to unit to end of main group, removes from flankers
  Flanker: Moves to start of flanker, removes from main

  */

  // Determine whether flank size has an effect.
  const free_spots = army.filter((_, index) => index < army.size).reduce((previous, current) => previous + (current ? 0 : 1), 0)
  const army_size = army.size - free_spots + reserve.size
  flank_size = army_size > army.size + 2 ? flank_size : 0
  let left_flank_size = Math.max(flank_size, Math.ceil((army.size - enemy_size) / 2.0))
  left_flank_size = Math.min(Math.floor(army.size / 2.0), left_flank_size)
  let right_flank_size = Math.max(flank_size, Math.floor((army.size - enemy_size) / 2.0))
  right_flank_size = Math.min(Math.ceil(army.size / 2.0), right_flank_size)

  if (round === 0) {
    // Initial deployment uses reversed order (so Primary unit is first and Secondary last).
    orderedMainReserve = orderedMainReserve.reverse()
    orderedFlankReserve = orderedFlankReserve.reverse()
  }
  else {
    // Reinforcement ignores flank sizes.
    left_flank_size = 0
    right_flank_size = 0
  }
  // Optimization to not drag units which have no chance to get picked.
  orderedMainReserve = orderedMainReserve.takeLast(free_spots)
  orderedFlankReserve = orderedFlankReserve.takeLast(free_spots)
  let index = half
  for (; index >= left_flank_size && index + right_flank_size < army.size && reserve.size > 0; index = nextIndex(index)) {
    if (army.get(index))
      continue
    if (orderedMainReserve.size > 0) {
      reserve = reserve.delete(reserve.indexOf(orderedMainReserve.last()))
      army = army.set(index, orderedMainReserve.last())
      orderedMainReserve = orderedMainReserve.pop()
    }
    else if (orderedFlankReserve.size > 0) {
      reserve = reserve.delete(reserve.indexOf(orderedFlankReserve.last()))
      army = army.set(index, orderedFlankReserve.last())
      orderedFlankReserve = orderedFlankReserve.pop()
    }
  }
  for (; index >= 0 && index < army.size && reserve.size > 0; index = nextIndex(index)) {
    if (army.get(index))
      continue
    if (orderedFlankReserve.size > 0) {
      reserve = reserve.delete(reserve.indexOf(orderedFlankReserve.last()))
      army = army.set(index, orderedFlankReserve.last())
      orderedFlankReserve = orderedFlankReserve.pop()
    }
    else if (orderedMainReserve.size > 0) {
      reserve = reserve.delete(reserve.indexOf(orderedMainReserve.last()))
      army = army.set(index, orderedMainReserve.last())
      orderedMainReserve = orderedMainReserve.pop()
    }
  }
  // From center to left.
  for (let unit_index = Math.ceil(army.size / 2.0) - 1; unit_index > 0; --unit_index) {
    const unit = army.get(unit_index)
    if (unit)
      continue
    const unit_on_left = army.get(unit_index - 1)
    if (unit_on_left) {
      army = army.set(unit_index, unit_on_left)
      army = army.set(unit_index - 1, undefined)
      if (attacker_to_defender)
        attacker_to_defender.forEach((target, index) => attacker_to_defender[index] = target === unit_index - 1 ? unit_index : target)
      continue
    }
  }
  // From center to right.
  for (let unit_index = Math.ceil(army.size / 2.0); unit_index < army.size - 1; ++unit_index) {
    const unit = army.get(unit_index)
    if (unit)
      continue
    const unit_on_right = army.get(unit_index + 1)
    if (unit_on_right) {
      army = army.set(unit_index, unit_on_right)
      army = army.set(unit_index + 1, undefined)
      if (attacker_to_defender)
        attacker_to_defender.forEach((target, index) => attacker_to_defender[index] = target === unit_index + 1 ? unit_index : target)
      continue
    }
  }
  return { army, reserve, defeated: armies.defeated }
}

/**
 * Selects targets for a given source_row from a given target_row.
 * Returns an array which maps attacker to defender.
 * @param source_row Attackers.
 * @param target_row Defenders.
 * @param flank_targets_near_own_edge Flanks pick targets near their edge.
 */
const pickTargets = (source_row: Army, target_row: Army, flank_targets_near_own_edge: boolean): Array<number | null> => {
  // Units attack mainly units on front of them. If not then first target from left to right.
  const attacker_to_defender = Array<number | null>(source_row.size)
  for (let i = 0; i < source_row.size; ++i)
    attacker_to_defender[i] = null
  source_row.forEach((source, source_index) => {
    if (!source)
      return
    let target_index: number | null = null
    if (target_row.get(source_index) )
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
 * Calculates effectiveness of a tactic against another tactic with a given army.
 * @param tactic Tactic to calculate.
 * @param front Units affecting positive bonus.
 * @param counter_tactic Opposing tactic, can counter or get countered.
 */
export const calculateTactic = (front: Army, tactic?: TacticDefinition, counter_tactic?: TacticDefinition): number => {
  const effectiveness = (tactic && counter_tactic) ? calculateValue(tactic, counter_tactic.type) : 0.0
  let unit_modifier = 1.0
  if (effectiveness > 0 && tactic) {
    let units = 0
    let weight = 0.0
    for (const unit of front) {
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
 * Adds given losses to a given row.
 * @param row Units which receive given losses. 
 * @param losses Losses added to units. 
 * @param round Turn number to separate losses caused by other rounds.
 */
const applyLosses = (row: Army, losses: Loss[], round: number): Army => {
  for (let i = 0; i < row.size; ++i) {
    if (row.get(i)) {
      const loss_values: [UnitCalc, number][] = [[UnitCalc.Morale, losses[i].morale], [UnitCalc.Manpower, losses[i].manpower]]
      row = row.update(i, unit => unit && addValues(unit, ValuesType.Loss, 'Round ' + round, loss_values))
    }
  }
  return row
}

const applyKills = (row: Army, kills: Kill[], round: number): Army => {
  for (let i = 0; i < row.size; ++i) {
    if (row.get(i)) {
      const kill_values: [UnitCalc, number][] = [[UnitCalc.MoraleDepleted, kills[i].morale], [UnitCalc.ManpowerDepleted, kills[i].manpower]]
      row = row.update(i, unit => unit && addValues(unit, ValuesType.Base, 'Round ' + round, kill_values))
    }
  }
  return row
}

const removeDefeated = (armies: Armies): Armies => {
  const army = armies.army.map(unit => unit && !unit.is_defeated ? unit : undefined)
  return { army, reserve: armies.reserve, defeated: armies.defeated }
}

const copyDefeated = (armies: Armies, definitions: Army, minimum_morale: number, minimum_manpower: number): Armies => {
  let defeated = armies.defeated
  const army = armies.army.map((_, index) => {
    const unit = definitions.get(index)
    if (!unit)
      return undefined
    if (calculateValue(unit, UnitCalc.Manpower) > minimum_manpower && calculateValue(unit, UnitCalc.Morale) > minimum_morale)
      return unit
    defeated = defeated.push(unit)
    return { ...unit, is_defeated: true }
  })
  return { army, reserve: armies.reserve, defeated }
}

/**
 * Calculates losses when a given source row attacks a given target row.
 * @param source_row A row of attackers inflicting daamge on target_row.
 * @param target_row A row of defenders receiving damage from source_row.
 * @param source_to_target Selected targets for attackers.
 * @param roll Dice roll, affects amount of damage inflicted.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 */
const attack = (source_row: Army, target_row: Army, source_to_target: (number | null)[], roll: number, terrains: Terrains, tactic_damage_multiplier: number, casualties_multiplier: number, settings: Settings): [Loss[], Kill[]] => {
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

export const calculateBaseDamage = (roll: number, settings: Settings): number => {
  const base_damage = settings.get(CombatParameter.BaseDamage) || 0.08
  const roll_damage = settings.get(CombatParameter.RollDamage) || 0.02
  return base_damage + roll_damage * roll
}

/**
 * Calculates both manpower and morale losses caused by a given attacker to a given defender.
 * @param source An attacker inflicting damange on target.
 * @param target A defender receiving damage from source.
 * @param roll Dice roll, affects amount of damage inflicted.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 */
const calculateLosses = (source: Unit, target: Unit, roll: number, terrains: Terrains, tactic_damage_multiplier: number, casualties_multiplier: number, settings: Settings): Loss => {
  const damage_reduction_per_experience = settings.get(CombatParameter.ExperienceDamageReduction) || 0.3
  const manpower_lost_multiplier = settings.get(CombatParameter.ManpowerLostMultiplier) || 0.2
  const morale_lost_multiplier = settings.get(CombatParameter.MoraleLostMultiplier) || 1.5
  const morale_base_damage = settings.get(CombatParameter.MoraleDamageBase) || 2.0
  let damage = calculateBaseDamage(roll, settings)
  damage = damage
    * calculateValue(source, UnitCalc.Offense)
    * calculateValue(source, UnitCalc.Discipline)
    * (1.0 + calculateValue(source, target.type))
    * tactic_damage_multiplier
    * (1.0 + terrains.map(terrain => terrain ? calculateValue(source, terrain.type) : 0).reduce((previous, current) => previous + current, 0))
    / calculateValue(target, UnitCalc.Defense)
    * (1.0 - damage_reduction_per_experience * calculateValue(target, UnitCalc.Experience))
  damage = Math.floor(damage * calculateValue(source, UnitCalc.Manpower))
  const manpower_lost = damage * manpower_lost_multiplier * (1.0 + casualties_multiplier) * (1.0 + calculateValue(target, UnitCalc.StrengthDamageTaken))
  const morale_multiplier = Math.floor(1000.0 * Math.max(0, calculateValue(source, UnitCalc.Morale)) / morale_base_damage) / 1000.0
  let morale_lost = Math.floor(Math.floor(damage * morale_multiplier) * morale_lost_multiplier)
  morale_lost = morale_lost + Math.floor(morale_lost * calculateValue(target, UnitCalc.MoraleDamageTaken))
  return { manpower: Math.floor(manpower_lost), morale: morale_lost / 1000.0 }
}
