import { Map } from 'immutable'
import { Unit, UnitCalc, UnitType, UnitDefinition } from '../units'
import { RowType, Army } from '../land_battle'
import { calculateValue, mergeValues } from '../../base_definition'
type Definition = Map<UnitType, UnitDefinition>
type RowTypes = Map<RowType, UnitType | undefined>

/**
 * Calculates the next index when the order is from center to edges.
 */
export const nextIndex = (index: number, center: number) => index < center ? index + 2 * (center - index) : index - 2 * (index - center) - 1

/**
 * Returns whether a given unit is a flanker.
 * Units with more than 2 maneuver are considered flankers, unless overridden by preferences.
 */
const isFlankUnit = (row_types: RowTypes, unit: Unit) => {
    if (unit.type === row_types.get(RowType.Flank))
        return true
    if (unit.type === row_types.get(RowType.Front) || unit.type === row_types.get(RowType.Back))
        return false
    return calculateValue(unit, UnitCalc.Maneuver) > 2
}

/**
 * Calculates left and right flank sizes.
 * By default, flank starts where the enemy frontline ends. Preference can override this.
 * @param round Flank only works for the initial deployment.
 * @param flank_size Minimum preferred flank size. Doesn't work with small armies.
 * @param front_size Size of the front line.
 * @param reserve_size Size of the reserve.
 * @param free_spots Amount of free spots in the frontline.
 * @param enemy_size Size of the enemy army.
 */
const calculateFlankSizes = (round: number, flank_size: number, front_size: number, reserve_size: number, free_spots : number, enemy_size: number): [number, number] => {
    if (round > 0)
        return [0, 0]
    const army_size = front_size - free_spots + reserve_size
    // Determine whether the preferred flank size has any effect.
    // Note: Only tested with combat width of 30. +2 might be a bug in the game.
    flank_size = army_size > front_size + 2 ? flank_size : 0
    let left_flank_size = Math.max(flank_size, Math.ceil((front_size - enemy_size) / 2.0))
    // Ensure that the flank doesn't spill over the center with small combat sizes.
    left_flank_size = Math.min(Math.floor(front_size / 2.0), left_flank_size)
    let right_flank_size = Math.max(flank_size, Math.floor((front_size - enemy_size) / 2.0))
    right_flank_size = Math.min(Math.ceil(front_size / 2.0), right_flank_size)
    return [left_flank_size, right_flank_size]
}

/**
 * Reinforces a given army based on reinforcement rules.
 * First priority is to move units from reserve. Then units move towards center.
 * Initial deployment has different rules than reinforcement.
 * @param army Frontline and reserve.
 * @param definitions Definitions to calculate priorities.
 * @param round Round number is used to check for the initial deployment.
 * @param row_types Preferred unit types.
 * @param flank_size Minimum size of flanks. Only works for the initial deployment and if enough unit.
 * @param enemy_size Army size of the enemy. Affects size of flanks.
 * @param attacker_to_defender Output. Reinforcement may move units so this must be updated also.
 */
export const reinforce = (army: Army, definitions: Definition, round: number, row_types: RowTypes, flank_size: number, enemy_size: number, attacker_to_defender: (number | null)[] | undefined): Army => {
    let frontline = army.frontline
    let reserve = army.reserve

    const center = Math.floor(frontline.size / 2.0)

    // Separate reserve to main and flank groups.
    const mainReserve = reserve.filter(value => !isFlankUnit(row_types, mergeValues(value, definitions.get(value.type)!)))
    const flankReserve = reserve.filter(value => isFlankUnit(row_types, mergeValues(value, definitions.get(value.type)!)))
    // Calculate priorities (mostly based on unit type, ties are resolved with index numbers).
    let orderedMainReserve = mainReserve.sortBy((value, key) => {
        value = mergeValues(value, definitions.get(value.type)!)
        return -calculateValue(value, UnitCalc.Cost) * 10000 + key - (value.type === row_types.get(RowType.Front) ? 2000000 : 0) - (value.type === row_types.get(RowType.Back) ? -1000000 : 0)
    })
    let orderedFlankReserve = flankReserve.sortBy((value, key) => {
        value = mergeValues(value, definitions.get(value.type)!)
        return -calculateValue(value, UnitCalc.Maneuver) * 10000 + key - (value.type === row_types.get(RowType.Flank) ? 1000000 : 0)
    })

    const free_spots = frontline.filter((_, index) => index < frontline.size).reduce((previous, current) => previous + (current ? 0 : 1), 0)
    const [left_flank_size, right_flank_size] = calculateFlankSizes(round, flank_size, frontline.size, reserve.size, free_spots, enemy_size)

    if (round === 0) {
        // Initial deployment uses reversed order (so Primary unit is first and Secondary last).
        orderedMainReserve = orderedMainReserve.reverse()
        orderedFlankReserve = orderedFlankReserve.reverse()
    }
    // Optimization to not drag units in calculations which have no chance to get picked.
    orderedMainReserve = orderedMainReserve.takeLast(free_spots)
    orderedFlankReserve = orderedFlankReserve.takeLast(free_spots)
    let index = center
    // Fill main front until flanks are reached.
    for (; index >= left_flank_size && index + right_flank_size < frontline.size && reserve.size > 0; index = nextIndex(index, center)) {
        if (frontline.get(index))
            continue
        if (orderedMainReserve.size > 0) {
            reserve = reserve.delete(reserve.indexOf(orderedMainReserve.last()))
            frontline = frontline.set(index, orderedMainReserve.last())
            orderedMainReserve = orderedMainReserve.pop()
        }
        else if (orderedFlankReserve.size > 0) {
            reserve = reserve.delete(reserve.indexOf(orderedFlankReserve.last()))
            frontline = frontline.set(index, orderedFlankReserve.last())
            orderedFlankReserve = orderedFlankReserve.pop()
        }
    }
    // Fill flanks with remaining units.
    for (; index >= 0 && index < frontline.size && reserve.size > 0; index = nextIndex(index, center)) {
        if (frontline.get(index))
            continue
        if (orderedFlankReserve.size > 0) {
            reserve = reserve.delete(reserve.indexOf(orderedFlankReserve.last()))
            frontline = frontline.set(index, orderedFlankReserve.last())
            orderedFlankReserve = orderedFlankReserve.pop()
        }
        else if (orderedMainReserve.size > 0) {
            reserve = reserve.delete(reserve.indexOf(orderedMainReserve.last()))
            frontline = frontline.set(index, orderedMainReserve.last())
            orderedMainReserve = orderedMainReserve.pop()
        }
    }
    // Move units from left to center.
    for (let unit_index = Math.ceil(frontline.size / 2.0) - 1; unit_index > 0; --unit_index) {
        const unit = frontline.get(unit_index)
        if (unit)
            continue
        const unit_on_left = frontline.get(unit_index - 1)
        if (unit_on_left) {
            frontline = frontline.set(unit_index, unit_on_left)
            frontline = frontline.set(unit_index - 1, undefined)
            if (attacker_to_defender)
                attacker_to_defender.forEach((target, index) => attacker_to_defender[index] = target === unit_index - 1 ? unit_index : target)
            continue
        }
    }
    // Move units from right to center.
    for (let unit_index = Math.ceil(frontline.size / 2.0); unit_index < frontline.size - 1; ++unit_index) {
        const unit = frontline.get(unit_index)
        if (unit)
            continue
        const unit_on_right = frontline.get(unit_index + 1)
        if (unit_on_right) {
            frontline = frontline.set(unit_index, unit_on_right)
            frontline = frontline.set(unit_index + 1, undefined)
            if (attacker_to_defender)
                attacker_to_defender.forEach((target, index) => attacker_to_defender[index] = target === unit_index + 1 ? unit_index : target)
            continue
        }
    }
    return { frontline, reserve, defeated: army.defeated }
}
