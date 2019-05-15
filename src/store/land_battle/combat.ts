import { List } from 'immutable'
import { UnitDefinition, UnitCalc } from '../units'

type Unit = UnitDefinition
type FrontLine = List<UnitDefinition | null>
type Army = List<List<UnitDefinition | null>>

const DAMAGE_REDUCTION_PER_EXPERIENCE = 0.3
const BASE_DAMAGE = 0.08
const BASE_DAMAGE_PER_ROLL = 0.02
const MANPOWER_LOST_MULTIPLIER = 0.2
const MORALE_LOST_MULTIPLIER = 1.5 / 2000.0

/**
 * Reinforces a given army based on reinforcement rules.
 * First priority is to move units from backlines. Then from right side if not at edge.
 */
const reinforce = (army: Army): Army => {
    // 1st assumption: Empty spots get filled by back row (not tested but makes sense).
    // 2nd assumption: If at edge, no reinforcement (tested both left and right side).
    // 3rd assumption: If not at edge, filled by unit on right (tested once, not sure if always happens).
    // Another possibility is that center is considered at index 13 (when 30 width) and reinforces towards that.
    for (let row_index = 0; row_index < army.size; row_index++) {
        const row = army.get(row_index)!
        for (let unit_index = 0; unit_index < row.size; unit_index++) {
            const unit = row.get(unit_index)
            if (unit) {
                // No need to reinforce
                continue
            }
            const unit_behind = row_index + 1 < army.size && army.get(row_index + 1)!.get(unit_index)
            if (unit_behind) {
                army = army.set(row_index, row.set(unit_index, unit_behind))
                army = army.set(row_index + 1, army.get(row_index + 1)!.set(unit_index, null))
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
                army = army.set(row_index, row.set(unit_index, unit_on_right))
                army = army.set(row_index, row.set(unit_index + 1, null))
                continue
            }      
        }
    }
    return army
}

interface AttackResult {
    morale: number
    manpower: number
    manpower_depleted: number
    morale_depleted: number
}

const get_initial_result_from_army = (army: Army): List<AttackResult> => army.get(0)!.map((unit) => ({
    morale: unit ? unit.calculateValue(UnitCalc.Morale) : 0,
    manpower: unit ? unit.calculateValue(UnitCalc.Manpower) : 0,
    manpower_depleted : 0,
    morale_depleted: 0
}))

/**
 * Makes given armies attack each other.
 */
const battle = (attacker_army: Army, defender_army: Army): [Army, Army] => {
    attacker_army = reinforce(attacker_army)
    defender_army = reinforce(defender_army)
    // Killed manpower won't deal any damage so the right solution has to be searched iteratively.
    let attacker_previous_result = get_initial_result_from_army(attacker_army)
    let defender_previous_result = get_initial_result_from_army(defender_army)
    
    return [attacker_army, defender_army]
}

const attack = (attacker_army: Army, defender_army: Army) => {
    // Units attack mainly units on front of them. If not, then a closest target is searched within maneuver.
    // Assumption: Right side searched first (shouldn't affect results because gaps get reinforced).
    const attacker_frontline = attacker_army.get(0)!
    const defender_frontline = defender_army.get(0)!
    for (let unit_index = 0; unit_index < attacker_frontline.size; unit_index++) {
        const attacker = attacker_frontline.get(unit_index)
        if (!attacker)
            continue
        const defender = defender_frontline.get(unit_index)
    }
}

/**
 * Calculates both manpower and morale damage caused by a given attacker to a given defender.
 */
const calculateDamage = (attacker: Unit, defender: Unit, roll: number): [number, number] => {
    const base_damage = BASE_DAMAGE + BASE_DAMAGE_PER_ROLL * roll
    // Terrain bonus and tactic missing.
    const damage = base_damage
         * attacker.calculateValue(UnitCalc.Discipline)
         * attacker.calculateValue(UnitCalc.Manpower)
         * attacker.calculateValue(defender.type)
         * attacker.calculateValue(UnitCalc.Offense)
         / defender.calculateValue(UnitCalc.Defense)
         * (1 - DAMAGE_REDUCTION_PER_EXPERIENCE * defender.calculateValue(UnitCalc.Experience))
    const manpower_lost = damage * MANPOWER_LOST_MULTIPLIER
    const morale_lost = damage * MORALE_LOST_MULTIPLIER * attacker.calculateValue(UnitCalc.Morale)
    return [Math.floor(manpower_lost), Math.floor(100.0 * morale_lost) / 100.0]
}
