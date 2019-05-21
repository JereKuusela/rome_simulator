import { List } from 'immutable'
import { UnitDefinition, UnitCalc } from '../units'
import { TerrainDefinition } from '../terrains'
import { TacticDefinition, TacticCalc} from '../tactics'

type Unit = UnitDefinition
type FrontLine = List<UnitDefinition | null>
type Army = List<List<UnitDefinition | null>>
type Terrains = List<TerrainDefinition>

interface Loss {
  morale: number
  manpower: number
}

const DAMAGE_REDUCTION_PER_EXPERIENCE = 0.3
const BASE_DAMAGE = 0.08
const BASE_DAMAGE_PER_ROLL = 0.02
const MANPOWER_LOST_MULTIPLIER = 0.2
const MORALE_LOST_MULTIPLIER = 1.5 / 2000.0


/**
 * Makes given armies attach each other.
 * @param attacker_army Attackers.
 * @param defender_army Defenders.
 * @param attacker_roll Dice roll for attackers. Affects damage dealt. 
 * @param defender_roll Dice roll for defenders. Affects damage dealt. 
 * @param round Turn number to distinguish different rounds.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 */
export const battle = (attacker_army: Army, defender_army: Army, attacker_roll: number, defender_roll: number, attacker_tactic: TacticDefinition | null, defender_tactic: TacticDefinition | null, round: number, terrains: Terrains): [Army, Army] => {
  // General flow:
  // 1. Attacker reinforces.
  // 2. Attacker picks targets.
  // 3. Defender reinforces.
  // 4. Defender picks targets.
  // Note: This leads to asymmetric behavior. A defender reinforcing gets a free attack on the attacker.
  
  attacker_army = reinforce(attacker_army)
  defender_army = reinforce(defender_army)
  let attacker_frontline = attacker_army.get(0)!
  let defender_frontline = defender_army.get(0)!
  // Killed manpower won't deal any damage so the right solution has to be searched iteratively.

  const tactic_effects = {
    attacker: calculateTactic(attacker_tactic, attacker_army, defender_tactic),
    defender: calculateTactic(defender_tactic, defender_army, attacker_tactic),
    casualties: 1.0 + (attacker_tactic ? attacker_tactic.calculateValue(TacticCalc.Casualties) : 0) + (defender_tactic ? defender_tactic.calculateValue(TacticCalc.Casualties) : 0)
  }

  // Previous losses are used to calculate attack damage.
  let attacker_previous_losses = Array<Loss>(attacker_frontline.size).fill({ morale: 0, manpower: 0 })
  let defender_previous_losses = Array<Loss>(defender_frontline.size).fill({ morale: 0, manpower: 0 })

  for (let iteration = 0; iteration < 100; ++iteration) {
    // Current loses are used to check when the solution is found, and to calculate damange on the next iteration.
    let defender_losses = attack(attacker_frontline, defender_frontline, attacker_previous_losses, attacker_roll, terrains, tactic_effects.attacker, tactic_effects.casualties)
    let attacker_losses = attack(defender_frontline, attacker_frontline, defender_previous_losses, defender_roll, terrains, tactic_effects.defender, tactic_effects.casualties)
    if (arraysEqual(attacker_previous_losses, attacker_losses) && arraysEqual(defender_previous_losses, defender_losses))
      break
    attacker_previous_losses = attacker_losses
    defender_previous_losses = defender_losses
  }
  attacker_army = attacker_army.update(0, row => applyLosses(row, attacker_previous_losses, round))
  defender_army = defender_army.update(0, row => applyLosses(row, defender_previous_losses, round))
  return [attacker_army, defender_army]
}

/**
 * Reinforces a given army based on reinforcement rules.
 * First priority is to move units from backlines. Then from sides.
 * @param army Army to reinforce.
 */
const reinforce = (army: Army): Army => {
  // 1: Empty spots get filled by back row.
  // 2: If still holes, units move towards center.
  for (let row_index = 0; row_index < army.size; ++row_index) {
    const row = army.get(row_index)!
    // Backrow.
    for (let unit_index = 0; unit_index < row.size; ++unit_index) {
      const unit = row.get(unit_index)
      if (unit)
        continue
      const unit_behind = row_index + 1 < army.size && army.get(row_index + 1)!.get(unit_index)
      if (unit_behind) {
        army = army.setIn([row_index, unit_index], unit_behind)
        army = army.setIn([row_index + 1, unit_index], null)
        continue
      }
    }
    // From center to left.
    for (let unit_index = Math.floor(row.size / 2.0); unit_index >= 0; --unit_index) {
      const unit = row.get(unit_index)
      if (unit)
        continue
      const unit_on_left = unit_index > 1 && row.get(unit_index - 1)
      if (unit_on_left) {
        army = army.setIn([row_index, unit_index], unit_on_left)
        army = army.setIn([row_index, unit_index - 1], null)
        continue
      }
    }
    // From center to right.
    for (let unit_index = Math.ceil(row.size / 2.0); unit_index < row.size; ++unit_index) {
      const unit = row.get(unit_index)
      if (unit)
        continue
      const unit_on_right = unit_index + 1 < row.size && row.get(unit_index + 1)
      if (unit_on_right) {
        army = army.setIn([row_index, unit_index], unit_on_right)
        army = army.setIn([row_index, unit_index + 1], null)
        continue
      }
    }
  }
  return army
}

/**
 * Calculates effectiveness of a tactic against another tactic with a given army.
 * @param tactic Tactic to calculate.
 * @param army Units affecting positive bonus.
 * @param counter_tactic Opposing tactic, can counter or get countered.
 */
const calculateTactic = (tactic: TacticDefinition | null, army: Army, counter_tactic: TacticDefinition | null): number => {
  if (!tactic || ! counter_tactic)
    return 1.0
  const effectiveness = tactic.calculateValue(counter_tactic.type)
  let unit_modifier = 1.0
  if (effectiveness > 0) {
    let units = 0
    let weight = 0.0
    for (const row of army) {
      for (const unit of row) {
        if (!unit)
          continue
        units += 1
        weight += tactic.calculateValue(unit.type)
      }
    }
    if (units)
      unit_modifier += weight / units
  }
  return 1.0 + effectiveness * unit_modifier
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

// TODO: Move to utils.
/**
 * Returns true if given arrays have same values.
 * @param a 
 * @param b 
 */
const arraysEqual = (a: Loss[], b: Loss[]) => {
  if (a === b)
    return true
  if (a.length !== b.length)
    return false
  for (let i = 0; i < a.length; ++i) {
    if (a[i].morale !== b[i].morale || a[i].manpower !== b[i].manpower)
      return false
  }
  return true
}

/**
 * Calculates losses when a given source row attacks a given target row.
 * @param source_row A row of attackers inflicting daamge on target_row.
 * @param target_row A row of defenders receiving damage from source_row.
 * @param source_losses Current losses for attackers to exclude dead men.
 * @param roll Dice roll, affects amount of damage inflicted.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 */
const attack = (source_row: FrontLine, target_row: FrontLine, source_losses: Loss[], roll: number, terrains: Terrains, tactic_damage_multiplier: number, casualties_multiplier: number): Loss[] => {
  // Units attack mainly units on front of them. If not, then a closest target is searched within maneuver.
  // Assumption: Right side searched first (shouldn't affect results because gaps get reinforced).
  let target_losses = Array<Loss>(target_row.size)
  for (var i = 0; i < target_row.size; ++i)
    target_losses[i] = { morale: 0, manpower: 0 };
  source_row.forEach((source, source_index) => {
    if (!source)
      return
    let target_index: number | null = null
    if (target_row.get(source_index))
      target_index = source_index
    else if (source_index + 1 < source_row.size && target_row.get(source_index + 1))
      target_index = source_index + 1
    else if (source_index > 0 && target_row.get(source_index - 1))
      target_index = source_index - 1
    if (target_index === null)
      return
    const target = target_row.get(source_index)!
    const losses = calculateLosses(source, target, source_losses[source_index], roll, terrains, tactic_damage_multiplier, casualties_multiplier)
    target_losses[target_index].manpower += losses.manpower
    target_losses[target_index].morale += losses.morale
  })
  return target_losses
}

/**
 * Calculates both manpower and morale losses caused by a given attacker to a given defender.
 * @param source An attacker inflicting damange on target.
 * @param target A defender receiving damage from source.
 * @param source_loss Current loss for the attacker to exclude dead men.
 * @param roll Dice roll, affects amount of damage inflicted.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 */
const calculateLosses = (source: Unit, target: Unit, source_loss: Loss, roll: number, terrains: Terrains, tactic_damage_multiplier: number, casualties_multiplier: number): Loss => {
  const base_damage = BASE_DAMAGE + BASE_DAMAGE_PER_ROLL * roll
  // Terrain bonus and tactic missing.
  const damage = base_damage
    * source.calculateValue(UnitCalc.Discipline)
    * Math.max(0, source.calculateValue(UnitCalc.Manpower) - source_loss.manpower)
    * source.calculateValue(target.type)
    * source.calculateValue(UnitCalc.Offense)
    * tactic_damage_multiplier
    * terrains.map(terrain => source.calculateValue(terrain.type)).reduce((previous, current) => previous + current, 0)
    / target.calculateValue(UnitCalc.Defense)
    * (1 - DAMAGE_REDUCTION_PER_EXPERIENCE * target.calculateValue(UnitCalc.Experience))
  const manpower_lost = damage * MANPOWER_LOST_MULTIPLIER * target.calculateValue(UnitCalc.StrengthDamageTaken) * casualties_multiplier
  const morale_lost = damage * MORALE_LOST_MULTIPLIER * Math.max(0, source.calculateValue(UnitCalc.Morale) - source_loss.morale) * target.calculateValue(UnitCalc.MoraleDamageTaken)
  return { manpower: Math.floor(manpower_lost), morale: Math.floor(100.0 * morale_lost) / 100.0 }
}
