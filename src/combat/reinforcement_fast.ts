import { Frontline, Reserve } from './combat_fast'

/**
 * Calculates the next index when the order is from center to edges.
 */
export const nextIndex = (index: number, center: number) => index < center ? index + 2 * (center - index) : index - 2 * (index - center) - 1


const reinforceUnits = (frontline: Frontline, reserve: Reserve) => {
    const center = Math.floor(frontline.length / 2.0)

    // Reinforce missing units.
    for (let index = center; index >= 0 && index < frontline.length; index = nextIndex(index, center)) {
        if (frontline[index])
            continue
        const unit = reserve.pop()
        if (unit) {
            frontline[index] = unit
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
export const reinforce = (frontline: Frontline, reserve: Reserve) => {
    if (reserve.length)
        reinforceUnits(frontline, reserve)
    moveUnits(frontline)
}
