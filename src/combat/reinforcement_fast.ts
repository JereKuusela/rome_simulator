import { sortBy } from 'lodash'

import { UnitCalc } from '../store/units'
import { RowType, RowTypes } from '../store/battle'

import { Frontline, Reserve, CombatUnit } from './combat_fast'

/**
 * Calculates the next index when the order is from center to edges.
 */
export const nextIndex = (index: number, center: number) => index < center ? index + 2 * (center - index) : index - 2 * (index - center) - 1


export type SortedReserve = {
    main: CombatUnit[]
    flank: CombatUnit[]
}

export const sortReserve = (reserve: Reserve, row_types: RowTypes): SortedReserve => {
    const mainReserve = reserve.filter(value => !isFlankUnit(row_types, value))
    const flankReserve = reserve.filter(value => isFlankUnit(row_types, value))
    // Calculate priorities (mostly based on unit type, ties are resolved with index numbers).
    const main = sortBy(mainReserve, value => {
        return -value.info[UnitCalc.Cost] * 100000 - value.info[UnitCalc.Strength] * 1000 - (value.info.type === row_types[RowType.Primary] ? 200000000 : 0) - (value.info.type === row_types[RowType.Secondary] ? -100000000 : 0)
    })
    const flank = sortBy(flankReserve, value => {
        return -value.info[UnitCalc.Maneuver] * 100000 - value.info[UnitCalc.Strength] * 1000 - (value.info.type === row_types[RowType.Flank] ? 100000000 : 0)
    })
    return { main, flank }
}

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

const reinforceUnits = (frontline: Frontline, reserve: SortedReserve) => {
    const center = Math.floor(frontline.length / 2.0)

    // Fill main front until flanks are reached.
    for (let index = center; index >= 0 && index < frontline.length; index = nextIndex(index, center)) {
        if (frontline[index])
            continue
        const main = reserve.main.pop()
        if (main) {
            frontline[index] = main
            continue
        }
        const flank = reserve.flank.pop()
        if (flank) {
            frontline[index] = flank
            continue
        }
        break
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
export const reinforce = (frontline: Frontline, reserve: SortedReserve) => {
    if (reserve.main.length || reserve.flank.length)
        reinforceUnits(frontline, reserve)
    moveUnits(frontline)
}
