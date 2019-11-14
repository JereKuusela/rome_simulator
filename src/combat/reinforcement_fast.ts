import { sortBy, remove } from 'lodash'

import { UnitCalc } from '../store/units'
import { RowType, RowTypes } from '../store/battle'

import { CombatUnits, Frontline, Reserve, CombatUnit } from './combat_fast'

/**
 * Calculates the next index when the order is from center to edges.
 */
export const nextIndex = (index: number, center: number) => index < center ? index + 2 * (center - index) : index - 2 * (index - center) - 1

/**
 * Returns whether a given unit is a flanker.
 */
const isFlankUnit = (row_types: RowTypes, unit: CombatUnit) => {
    if (unit.info.type === row_types[RowType.Flank])
        return true
    if (unit.info.type === row_types[RowType.Primary] || unit.info.type === row_types[RowType.Secondary])
        return false
    return unit.info.is_flank
}

const reinforceUnits = (frontline: Frontline, reserve: Reserve, row_types: RowTypes) => {
    const center = Math.floor(frontline.length / 2.0)// Separate reserve to main and flank groups.

    const mainReserve = reserve.filter(value => !isFlankUnit(row_types, value))
    const flankReserve = reserve.filter(value => isFlankUnit(row_types, value))
    // Calculate priorities (mostly based on unit type, ties are resolved with index numbers).
    let orderedMainReserve = sortBy(mainReserve, value => {
        return -value.info[UnitCalc.Cost] * 100000 - value.info[UnitCalc.Strength] * 1000 - (value.info.type === row_types[RowType.Primary] ? 200000000 : 0) - (value.info.type === row_types[RowType.Secondary] ? -100000000 : 0)
    })
    let orderedFlankReserve = sortBy(flankReserve, value => {
        return -value.info[UnitCalc.Maneuver] * 100000 - value.info[UnitCalc.Strength] * 1000 - (value.info.type === row_types[RowType.Flank] ? 100000000 : 0)
    })

    const free_spots = frontline.filter((_, index) => index < frontline.length).reduce((previous, current) => previous + (current ? 0 : 1), 0)

    // Optimization to not drag units in calculations which have no chance to get picked.
    orderedMainReserve = orderedMainReserve.slice(-free_spots)
    orderedFlankReserve = orderedFlankReserve.slice(-free_spots)

    let index = center
    // Fill main front until flanks are reached.
    for (; index >= 0 && index < frontline.length && reserve.length > 0; index = nextIndex(index, center)) {
        if (frontline[index])
            continue
        const main = orderedMainReserve.pop()
        if (main) {
            remove(reserve, value => value === main)
            frontline[index] = main
            continue
        }
        const flank = orderedFlankReserve.pop()
        if (flank) {
            remove(reserve, value => value === flank)
            frontline[index] = flank
            continue
        }
    }
}

const moveUnits = (frontline: Frontline) => {
    // Move units from left to center.
    for (let unit_index = Math.ceil(frontline.length / 2.0) - 1; unit_index > 0; --unit_index) {
        const unit = frontline[unit_index]
        if (unit)
            continue
        const unit_on_left = frontline[unit_index - 1]
        if (unit_on_left) {
            frontline[unit_index] = unit_on_left
            frontline[unit_index - 1] = null
            continue
        }
    }
    // Move units from right to center.
    for (let unit_index = Math.ceil(frontline.length / 2.0); unit_index < frontline.length - 1; ++unit_index) {
        const unit = frontline[unit_index]
        if (unit)
            continue
        const unit_on_right = frontline[unit_index + 1]
        if (unit_on_right) {
            frontline[unit_index] = unit_on_right
            frontline[unit_index + 1] = null
            continue
        }
    }
}

/**
 * Reinforces a given army based on reinforcement rules.
 * First priority is to move units from reserve. Then units move towards center.
 * Deployment not supported (slower function can be used).
 */
export const reinforce = (army: CombatUnits, row_types: RowTypes) => {
    let frontline = army.frontline
    let reserve = army.reserve

    if (reserve.length)
        reinforceUnits(frontline, reserve, row_types)
    moveUnits(frontline)
}
