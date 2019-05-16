import { List } from 'immutable'
import { UnitDefinition, UnitCalc } from '../units'
import { TerrainType } from '../terrains'

type Unit = UnitDefinition
type FrontLine = List<UnitDefinition | null>
type Army = List<List<UnitDefinition | null>>

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
 * @param border_terrain Terrain of the border between attackers, may affect amount of damage inflicted.
 * @param tile_terrain Terrain of the tile where the battle happens, may affect amount of damage inflicted.
 */
export const battle = (attacker_army: Army, defender_army: Army, attacker_roll: number, defender_roll: number, round: number, border_terrain: TerrainType, tile_terrain: TerrainType): [Army, Army] => {
  attacker_army = reinforce(attacker_army)
  defender_army = reinforce(defender_army)
  let attacker_frontline = attacker_army.get(0)!
  let defender_frontline = defender_army.get(0)!
  // Killed manpower won't deal any damage so the right solution has to be searched iteratively.

  // Previous losses are used to calculate attack damage.
  let attacker_previous_losses = Array<Loss>(attacker_frontline.size).fill({ morale: 0, manpower: 0 })
  let defender_previous_losses = Array<Loss>(defender_frontline.size).fill({ morale: 0, manpower: 0 })

  for (let iteration = 0; iteration < 100; ++iteration) {
    // Current loses are used to check when the solution is found, and to calculate damange on the next iteration.
    let defender_losses = attack(attacker_frontline, defender_frontline, attacker_previous_losses, attacker_roll, border_terrain, tile_terrain)
    let attacker_losses = attack(defender_frontline, attacker_frontline, defender_previous_losses, defender_roll, border_terrain, tile_terrain)
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
 * First priority is to move units from backlines. Then from right side if not at edge.
 * @param army Army to reinforce.
 */
const reinforce = (army: Army): Army => {
  // 1st assumption: Empty spots get filled by back row (not tested but makes sense).
  // 2nd assumption: If at edge, no reinforcement (tested both left and right side).
  // 3rd assumption: If not at edge, filled by unit on right (tested once, not sure if always happens).
  // Another possibility is that center is considered at index 13 (when 30 width) and reinforces towards that.
  for (let row_index = 0; row_index < army.size; ++row_index) {
    const row = army.get(row_index)!
    for (let unit_index = 0; unit_index < row.size; ++unit_index) {
      const unit = row.get(unit_index)
      if (unit) {
        // No need to reinforce
        continue
      }
      const unit_behind = row_index + 1 < army.size && army.get(row_index + 1)!.get(unit_index)
      if (unit_behind) {
        army = army.setIn([row_index, unit_index], unit_behind)
        army = army.setIn([row_index + 1, unit_index], null)
        continue
      }
      let is_on_edge = true
      for (let edge_index = 0; edge_index < unit_index; edge_index++) {
        if (row.get(edge_index)) {
          is_on_edge = false
          break
        }
      }
      if (!is_on_edge) {
        for (let edge_index = unit_index + 1; edge_index < row.size; edge_index++) {
          if (row.get(edge_index)) {
            is_on_edge = false
            break
          }
        }
      }
      if (is_on_edge) {
        // No need to reinforce from sides.
        continue
      }
      // Right side maybe has a higher priority.
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
const arraysEqual = (a: any[], b: any[]) => {
  if (a === b)
    return true
  if (a.length !== b.length)
    return false
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i])
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
 * @param border_terrain Terrain of the border between attackers, may affect amount of damage inflicted.
 * @param tile_terrain Terrain of the tile where the battle happens, may affect amount of damage inflicted.
 */
const attack = (source_row: FrontLine, target_row: FrontLine, source_losses: Loss[], roll: number, border_terrain: TerrainType, tile_terrain: TerrainType): Loss[] => {
  // Units attack mainly units on front of them. If not, then a closest target is searched within maneuver.
  // Assumption: Right side searched first (shouldn't affect results because gaps get reinforced).
  let target_losses = Array<Loss>(target_row.size).fill({ morale: 0, manpower: 0 })
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
    const losses = calculateLosses(source, target, source_losses[source_index], roll)
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
 * @param border_terrain Terrain of the border between attackers, may affect amount of damage inflicted.
 * @param tile_terrain Terrain of the tile where the battle happens, may affect amount of damage inflicted.
 */
const calculateLosses = (source: Unit, target: Unit, source_loss: Loss, roll: number, border_terrain: TerrainType, tile_terrain: TerrainType): Loss => {
  const base_damage = BASE_DAMAGE + BASE_DAMAGE_PER_ROLL * roll
  // Terrain bonus and tactic missing.
  const damage = base_damage
    * source.calculateValue(UnitCalc.Discipline)
    * Math.max(0, source.calculateValue(UnitCalc.Manpower) - source_loss.manpower)
    * source.calculateValue(target.type)
    * source.calculateValue(UnitCalc.Offense)
    * source.calculateValue(border_terrain)
    * source.calculateValue(tile_terrain)
    / target.calculateValue(UnitCalc.Defense)
    * (1 - DAMAGE_REDUCTION_PER_EXPERIENCE * target.calculateValue(UnitCalc.Experience))
  const manpower_lost = damage * MANPOWER_LOST_MULTIPLIER * target.calculateValue(UnitCalc.StrengthDamageTaken)
  const morale_lost = damage * MORALE_LOST_MULTIPLIER * Math.max(0, source.calculateValue(UnitCalc.Morale) - source_loss.morale) * target.calculateValue(UnitCalc.MoraleDamageTaken)
  return { manpower: Math.floor(manpower_lost), morale: Math.floor(100.0 * morale_lost) / 100.0 }
}
