import { List } from 'immutable'
import { UnitDefinition, UnitCalc } from '../units'
import { TerrainDefinition, TerrainCalc } from '../terrains'
import { TacticDefinition, TacticCalc } from '../tactics'
import { ParticipantState } from './types'

type Unit = UnitDefinition
type FrontLine = List<UnitDefinition | null>
type Army = List<List<UnitDefinition | null>>
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


/**
 * Makes given armies attach each other.
 * @param attacker Attackers.
 * @param defender Defenders.
 * @param round Turn number to distinguish different rounds.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 */
export const battle = (attacker: ParticipantState, defender: ParticipantState, round: number, terrains: Terrains): [Army, Army, Army, Army] => {
  // General flow:
  // 1. Attacker reinforces.
  // 2. Attacker picks targets.
  // 3. Defender reinforces.
  // 4. Defender picks targets.
  // Note: This leads to asymmetric behavior because defenders may move after attacker has selected them. Also a reinforced defender gets a free attack on the attacker.
  //console.log('')
  //console.log('********** ROUND ' + round + '*********')
  //console.log('')
  let attacker_army = reinforce(attacker.army, undefined)
  let attacker_to_defender = pickTargets(attacker_army.get(0)!, defender.army.get(0)!)
  let defender_army = reinforce(defender.army, attacker_to_defender)
  let defender_to_attacker = pickTargets(defender_army.get(0)!, attacker_army.get(0)!)
  if (round < 1)
    return [attacker_army, defender_army, attacker.defeated_army, defender.defeated_army]
  //console.log('Targets: A ' + attacker_to_defender + ' D ' + defender_to_attacker)
  let attacker_frontline = attacker_army.get(0)!
  let defender_frontline = defender_army.get(0)!
  // Killed manpower won't deal any damage so the right solution has to be searched iteratively.

  const tactic_effects = {
    attacker: calculateTactic(attacker.tactic, attacker_frontline, defender.tactic),
    defender: calculateTactic(defender.tactic, defender_frontline, attacker.tactic),
    casualties: (attacker.tactic ? attacker.tactic.calculateValue(TacticCalc.Casualties) : 0) + (defender.tactic ? defender.tactic.calculateValue(TacticCalc.Casualties) : 0)
  }
  //console.log('Tactics: A ' + tactic_effects.attacker + ' D ' + tactic_effects.defender + ' C ' + tactic_effects.casualties)

  const attacker_roll = modifyRoll(attacker.roll, terrains, attacker.general, defender.general)
  const defender_roll = modifyRoll(defender.roll, List(), defender.general, attacker.general)

  //console.log('Rolls: A ' + attacker_roll + ' D ' + defender_roll)
  let [defender_losses, attacker_kills] = attack(attacker_frontline, defender_frontline, attacker_to_defender, attacker_roll, terrains, tactic_effects.attacker, tactic_effects.casualties)
  let [attacker_losses, defender_kills] = attack(defender_frontline, attacker_frontline, defender_to_attacker, defender_roll, terrains, tactic_effects.defender, tactic_effects.casualties)
  attacker_army = attacker_army.update(0, row => applyLosses(row, attacker_losses, round))
  defender_army = defender_army.update(0, row => applyLosses(row, defender_losses, round))
  attacker_army = attacker_army.update(0, row => applyKills(row, attacker_kills, round))
  defender_army = defender_army.update(0, row => applyKills(row, defender_kills, round))
  let attacker_defeated_army = copyDefeated(attacker_army, attacker.defeated_army)
  let defender_defeated_army = copyDefeated(defender_army, defender.defeated_army)
  attacker_army = removeDefeated(attacker_army)
  defender_army = removeDefeated(defender_army)
  return [attacker_army, defender_army, attacker_defeated_army, defender_defeated_army]
}

const modifyRoll = (roll: number, terrains: Terrains, general: number, opposing_general: number) => {
  const terrain_effect = terrains.map(terrain => terrain.calculateValue(TerrainCalc.Roll)).reduce((previous, current) => previous + current, 0)
  const general_effect = Math.max(0, Math.floor((general - opposing_general) / 2.0))
  return roll + terrain_effect + general_effect
}

/**
 * Reinforces a given army based on reinforcement rules.
 * First priority is to move units from backlines. Then from sides.
 * @param army Army to reinforce.
 * @param attacker_to_defender Selected targets as reinforcement may move units.
 */
const reinforce = (army: Army, attacker_to_defender: (number | null)[] | undefined): Army => {
  // 1: Empty spots get filled by back row.
  // 2: If still holes, units move towards center.
  for (let row_index = 0; row_index < army.size; ++row_index) {
    let row = army.get(row_index)!
    // Backrow.
    for (let unit_index = 0; unit_index < row.size; ++unit_index) {
      const unit = row.get(unit_index)
      if (unit)
        continue
      const unit_behind = row_index + 1 < army.size && army.get(row_index + 1)!.get(unit_index)
      if (unit_behind) {
        army = army.setIn([row_index, unit_index], unit_behind)
        army = army.setIn([row_index + 1, unit_index], null)
        row = army.get(row_index)!
        continue
      }
    }
    // From center to left.
    for (let unit_index = Math.ceil(row.size / 2.0) - 1; unit_index > 0; --unit_index) {
      const unit = row.get(unit_index)
      if (unit)
        continue
      const unit_on_left = row.get(unit_index - 1)
      if (unit_on_left) {
        army = army.setIn([row_index, unit_index], unit_on_left)
        army = army.setIn([row_index, unit_index - 1], null)
        row = army.get(row_index)!
        if (attacker_to_defender)
          attacker_to_defender.forEach((target, index) => attacker_to_defender[index] = target === unit_index - 1 ? unit_index : target)
        continue
      }
    }
    // From center to right.
    for (let unit_index = Math.ceil(row.size / 2.0); unit_index < row.size - 1; ++unit_index) {
      const unit = row.get(unit_index)
      if (unit)
        continue
      const unit_on_right = row.get(unit_index + 1)
      if (unit_on_right) {
        army = army.setIn([row_index, unit_index], unit_on_right)
        army = army.setIn([row_index, unit_index + 1], null)
        row = army.get(row_index)!
        if (attacker_to_defender)
          attacker_to_defender.forEach((target, index) => attacker_to_defender[index] = target === unit_index + 1 ? unit_index : target)
        continue
      }
    }
  }
  return army
}

/**
 * Selects targets for a given source_row from a given target_row.
 * Returns an array which maps attacker to defender.
 * @param source_row Attackers.
 * @param target_row Defenders.
 */
const pickTargets = (source_row: FrontLine, target_row: FrontLine) => {
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
export const calculateTactic = (tactic: TacticDefinition | null, front: FrontLine, counter_tactic: TacticDefinition | null): number => {
  if (!tactic || !counter_tactic)
    return 1.0
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
const applyLosses = (row: FrontLine, losses: Loss[], round: number): FrontLine => {
  for (let i = 0; i < row.size; ++i) {
    if (row.get(i)) {
      const loss_values: [UnitCalc, number][] = [[UnitCalc.Morale, losses[i].morale], [UnitCalc.Manpower, losses[i].manpower]]
      row = row.update(i, unit => unit && unit.add_loss_values('Round ' + round, loss_values))
    }
  }
  return row
}

const applyKills = (row: FrontLine, kills: Kill[], round: number): FrontLine => {
  for (let i = 0; i < row.size; ++i) {
    if (row.get(i)) {
      const kill_values: [UnitCalc, number][] = [[UnitCalc.MoraleDepleted, kills[i].morale], [UnitCalc.ManpowerDepleted, kills[i].manpower]]
      row = row.update(i, unit => unit && unit.add_base_values('Round ' + round, kill_values))
    }
  }
  return row
}

const copyDefeated = (army: Army, defeated_army: Army): Army => {
  army.get(0)!.forEach(unit => {
    if (!unit)
      return
    if (unit.calculateValue(UnitCalc.Manpower) > 0 && unit.calculateValue(UnitCalc.Morale) > 0.25)
      return
    defeated_army = addDefeated(unit, defeated_army)
  })
  return defeated_army
}

const removeDefeated = (army: Army): Army => {
  return army.set(0, army.get(0)!.map(unit => unit && unit.calculateValue(UnitCalc.Manpower) > 0 && unit.calculateValue(UnitCalc.Morale) > 0.25 ? unit : null))
}

const addDefeated = (unit: UnitDefinition, defeated_army: Army): Army => {
  let row = 0
  let index = -1
  for (row = 0; row < defeated_army.size; ++row) {
    index = defeated_army.get(row)!.findIndex(unit => !unit)
    if (index > -1)
      return defeated_army.setIn([row, index], unit)
  }
  return defeated_army
}

/**
 * Calculates losses when a given source row attacks a given target row.
 * @param source_row A row of attackers inflicting daamge on target_row.
 * @param target_row A row of defenders receiving damage from source_row.
 * @param source_to_target Selected targets for attackers.
 * @param roll Dice roll, affects amount of damage inflicted.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 */
const attack = (source_row: FrontLine, target_row: FrontLine, source_to_target: (number | null)[], roll: number, terrains: Terrains, tactic_damage_multiplier: number, casualties_multiplier: number): [Loss[], Kill[]] => {
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
