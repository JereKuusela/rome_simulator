import { List, Map } from 'immutable'
import { UnitDefinition, UnitCalc, UnitType } from '../units'
import { TerrainDefinition, TerrainCalc } from '../terrains'
import { TacticDefinition, TacticCalc } from '../tactics'
import { RowType } from './types'

type Unit = UnitDefinition
type Army = List<UnitDefinition | undefined>
type Reserve = List<UnitDefinition>
type Defeated = List<UnitDefinition>
type Terrains = List<TerrainDefinition>

interface Loss {
  morale: number
  manpower: number
}

interface Kill {
  morale: number
  manpower: number
}

const DAMAGE_REDUCTION_PER_EXPERIENCE = 0.3
const BASE_DAMAGE = 0.08
const BASE_DAMAGE_PER_ROLL = 0.02
const MANPOWER_LOST_MULTIPLIER = 0.2

export interface ParticipantState {
  readonly army: List<UnitDefinition | undefined>
  readonly reserve: List<UnitDefinition>
  readonly defeated: List<UnitDefinition>
  readonly tactic: TacticDefinition
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
export const battle = (attacker: ParticipantState, defender: ParticipantState, round: number, terrains: Terrains): [Army, Army, Reserve, Reserve, Defeated, Defeated] => {
  // General flow:
  // 1. Attacker reinforces.
  // 2. Attacker picks targets.
  // 3. Defender reinforces.
  // 4. Defender picks targets.
  // Note: This leads to asymmetric behavior because defenders may move after attacker has selected them. Also a reinforced defender gets a free attack on the attacker.
  //console.log('')
  //console.log('********** ROUND ' + round + '*********')
  //console.log('')
  let [attacker_army, attacker_reserve] = reinforce(round, attacker.army, attacker.reserve, attacker.row_types, attacker.flank_size, countArmySize(defender.army, defender.reserve, defender.defeated), undefined)
  let attacker_to_defender = pickTargets(attacker_army, defender.army)
  let [defender_army, defender_reserve] = reinforce(round, defender.army, defender.reserve, defender.row_types, defender.flank_size, countArmySize(attacker.army, attacker.reserve, attacker.defeated), attacker_to_defender)
  let defender_to_attacker = pickTargets(defender_army, attacker_army)
  if (round < 1)
    return [attacker_army, defender_army, attacker_reserve, defender_reserve, attacker.defeated, defender.defeated]
  //console.log('Targets: A ' + attacker_to_defender + ' D ' + defender_to_attacker)
  // Killed manpower won't deal any damage so the right solution has to be searched iteratively.

  const tactic_effects = {
    attacker: calculateTactic(attacker.tactic, attacker_army, defender.tactic),
    defender: calculateTactic(defender.tactic, defender_army, attacker.tactic),
    casualties: (attacker.tactic ? attacker.tactic.calculateValue(TacticCalc.Casualties) : 0) + (defender.tactic ? defender.tactic.calculateValue(TacticCalc.Casualties) : 0)
  }
  //console.log('Tactics: A ' + tactic_effects.attacker + ' D ' + tactic_effects.defender + ' C ' + tactic_effects.casualties)

  const attacker_roll = modifyRoll(attacker.roll, terrains, attacker.general, defender.general)
  const defender_roll = modifyRoll(defender.roll, List(), defender.general, attacker.general)

  //console.log('Rolls: A ' + attacker_roll + ' D ' + defender_roll)
  let [defender_losses, attacker_kills] = attack(attacker_army, defender_army, attacker_to_defender, attacker_roll, terrains, tactic_effects.attacker, tactic_effects.casualties)
  let [attacker_losses, defender_kills] = attack(defender_army, attacker_army, defender_to_attacker, defender_roll, terrains, tactic_effects.defender, tactic_effects.casualties)
  attacker_army = applyLosses(attacker_army, attacker_losses, round)
  defender_army = applyLosses(defender_army, defender_losses, round)
  attacker_army = applyKills(attacker_army, attacker_kills, round)
  defender_army = applyKills(defender_army, defender_kills, round)
  let attacker_defeated_army = copyDefeated(attacker_army, attacker.defeated)
  let defender_defeated_army = copyDefeated(defender_army, defender.defeated)
  attacker_army = removeDefeated(attacker_army)
  defender_army = removeDefeated(defender_army)
  return [attacker_army, defender_army, attacker_reserve, defender_reserve, attacker_defeated_army, defender_defeated_army]
}

const modifyRoll = (roll: number, terrains: Terrains, general: number, opposing_general: number) => {
  const terrain_effect = terrains.map(terrain => terrain.calculateValue(TerrainCalc.Roll)).reduce((previous, current) => previous + current, 0)
  const general_effect = Math.max(0, Math.floor((general - opposing_general) / 2.0))
  return roll + terrain_effect + general_effect
}

const countArmySize = (army: Army, reserve: Reserve, defeated: Defeated) => army.reduce((previous, current) => previous + (current ? 1 : 0), 0) + reserve.size + defeated.size


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
const reinforce = (round: number, army: Army, reserve: Reserve, row_types: Map<RowType, UnitType>, flank_size: number, enemy_size: number, attacker_to_defender: (number | null)[] | undefined): [Army, Reserve] => {
  // 1: Empty spots get filled by back row.
  // 2: If still holes, units move towards center.
  // Backrow.
  const half = Math.floor(army.size / 2)

  const nextIndex = (index: number) => index < half ? index + 2 * (half - index) : index - 2 * (index - half) - 1

  const isFlankUnit = (unit: UnitDefinition) => {
    if (unit.type === row_types.get(RowType.Flank))
      return true
    if (unit.type === row_types.get(RowType.Front) || unit.type === row_types.get(RowType.Back))
      return false
    return unit.calculateValue(UnitCalc.Maneuver) > 2
  }

  const mainReserve = reserve.filter(value => !isFlankUnit(value))
  const flankReserve = reserve.filter(value => isFlankUnit(value))
  let orderedMainReserve = mainReserve.sortBy((value, key) => -value.calculateValue(UnitCalc.Cost) * 10000 + key - (value.type ===  row_types.get(RowType.Front) ? 2000000 : 0) - (value.type ===  row_types.get(RowType.Back) ? -1000000 : 0))
  let orderedFlankReserve = flankReserve.sortBy((value, key) => -value.calculateValue(UnitCalc.Maneuver) * 10000 + key - (value.type ===  row_types.get(RowType.Flank) ? 1000000 : 0))
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
  const free_spots = army.reduce((previous, current) => previous + (current ? 0 : 1), 0)
  // Optimization to not drag units which have no chance to get picked.
  orderedMainReserve = orderedMainReserve.take(free_spots)
  orderedFlankReserve = orderedFlankReserve.take(free_spots)
  const army_size = army.size - free_spots + reserve.size
  flank_size = army_size > 32 ? flank_size : 0
  let left_flank_size = Math.max(flank_size, Math.ceil((30 - enemy_size) / 2.0))
  let right_flank_size = Math.max(flank_size, Math.floor((30 - enemy_size) / 2.0))

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
  for (let index = half; index >= left_flank_size && index + right_flank_size < army.size && reserve.size > 0; index = nextIndex(index)) {
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
  for (let index = army.size - right_flank_size; index >= 0 && index < army.size && reserve.size > 0; index = nextIndex(index)) {
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
  return [army, reserve]
}

/**
 * Selects targets for a given source_row from a given target_row.
 * Returns an array which maps attacker to defender.
 * @param source_row Attackers.
 * @param target_row Defenders.
 */
const pickTargets = (source_row: Army, target_row: Army) => {
  // Units attack mainly units on front of them. If not then first target from left to right.
  const attacker_to_defender = Array<number | null>(target_row.size)
  for (let i = 0; i < target_row.size; ++i)
    attacker_to_defender[i] = null
  source_row.forEach((source, source_index) => {
    if (!source)
      return
    let target_index: number | null = null
    if (target_row.get(source_index))
      target_index = source_index
    else {
      const maneuver = source.calculateValue(UnitCalc.Maneuver)
      for (let index = source_index - maneuver; index <= source_index + maneuver; ++index) {
        if (index >= 0 && index < source_row.size && target_row.get(index)) {
          target_index = index
          break
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
export const calculateTactic = (tactic: TacticDefinition, front: Army, counter_tactic: TacticDefinition): number => {
  const effectiveness = tactic.calculateValue(counter_tactic.type)
  let unit_modifier = 1.0
  if (effectiveness > 0) {
    let units = 0
    let weight = 0.0
    for (const unit of front) {
      if (!unit)
        continue
      units += 1
      weight += tactic.calculateValue(unit.type)
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
      row = row.update(i, unit => unit && unit.add_loss_values('Round ' + round, loss_values))
    }
  }
  return row
}

const applyKills = (row: Army, kills: Kill[], round: number): Army => {
  for (let i = 0; i < row.size; ++i) {
    if (row.get(i)) {
      const kill_values: [UnitCalc, number][] = [[UnitCalc.MoraleDepleted, kills[i].morale], [UnitCalc.ManpowerDepleted, kills[i].manpower]]
      row = row.update(i, unit => unit && unit.add_base_values('Round ' + round, kill_values))
    }
  }
  return row
}

const copyDefeated = (army: Army, defeated_army: Defeated): Defeated => {
  army.forEach(unit => {
    if (!unit)
      return
    if (unit.calculateValue(UnitCalc.Manpower) > 0 && unit.calculateValue(UnitCalc.Morale) > 0.25)
      return
    defeated_army = defeated_army.push(unit)
  })
  return defeated_army
}

const removeDefeated = (army: Army): Army => {
  return army.map(unit => unit && unit.calculateValue(UnitCalc.Manpower) > 0 && unit.calculateValue(UnitCalc.Morale) > 0.25 ? unit : undefined)
}

/**
 * Calculates losses when a given source row attacks a given target row.
 * @param source_row A row of attackers inflicting daamge on target_row.
 * @param target_row A row of defenders receiving damage from source_row.
 * @param source_to_target Selected targets for attackers.
 * @param roll Dice roll, affects amount of damage inflicted.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 */
const attack = (source_row: Army, target_row: Army, source_to_target: (number | null)[], roll: number, terrains: Terrains, tactic_damage_multiplier: number, casualties_multiplier: number): [Loss[], Kill[]] => {
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
    const losses = calculateLosses(source, target, roll, terrains, tactic_damage_multiplier, casualties_multiplier)
    target_losses[target_index].manpower += losses.manpower
    target_losses[target_index].morale += losses.morale
    source_kills[source_index].manpower += losses.manpower
    source_kills[source_index].morale += losses.morale
  })
  return [target_losses, source_kills]
}

/**
 * Calculates both manpower and morale losses caused by a given attacker to a given defender.
 * @param source An attacker inflicting damange on target.
 * @param target A defender receiving damage from source.
 * @param roll Dice roll, affects amount of damage inflicted.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 */
const calculateLosses = (source: Unit, target: Unit, roll: number, terrains: Terrains, tactic_damage_multiplier: number, casualties_multiplier: number): Loss => {
  const base_damage = BASE_DAMAGE + BASE_DAMAGE_PER_ROLL * roll
  // Terrain bonus and tactic missing.
  let damage = base_damage
    * source.calculateValue(UnitCalc.Offense)
    * source.calculateValue(UnitCalc.Discipline)
    * (1.0 + source.calculateValue(target.type))
    * tactic_damage_multiplier
    * (1.0 + terrains.map(terrain => source.calculateValue(terrain.type)).reduce((previous, current) => previous + current, 0))
    / target.calculateValue(UnitCalc.Defense)
    * (1 - DAMAGE_REDUCTION_PER_EXPERIENCE * target.calculateValue(UnitCalc.Experience))
  damage = Math.floor(damage * source.calculateValue(UnitCalc.Manpower))
  const manpower_lost = damage * MANPOWER_LOST_MULTIPLIER * (1.0 + casualties_multiplier) * (1.0 + target.calculateValue(UnitCalc.StrengthDamageTaken))
  const morale_multiplier = Math.floor(1000.0 * Math.max(0, source.calculateValue(UnitCalc.Morale)) / 2.0) / 1000.0
  let morale_lost = Math.floor(Math.floor(damage * morale_multiplier) * 1.5)
  morale_lost = morale_lost + Math.floor(morale_lost * target.calculateValue(UnitCalc.MoraleDamageTaken))
  return { manpower: Math.floor(manpower_lost), morale: morale_lost / 1000.0 }
}
