import { Frontline, Reserve } from './combat'

/**
 * Calculates the next index when the order is from center to edges.
 */
export const nextIndex = (index: number, center: number) => index < center ? index + 2 * (center - index) : index - 2 * (index - center) - 1


const reinforceUnits = (frontline: Frontline, reserve: Reserve) => {
    const front = frontline[0]
    const center = Math.floor(frontline.length / 2.0)

    // Reinforce missing units.
    for (let index = center; index >= 0 && index < front.length; index = nextIndex(index, center)) {
        if (front[index])
            continue
        const unit = reserve.pop()
        if (unit) {
            front[index] = unit
            continue
        }
        break
    }
}

const moveUnits = (frontline: Frontline) => {
    for (let row = 0; row < frontline.length; row++) {
        const front = frontline[row]
        // Move units from left to center.
        for (let unit_index = Math.ceil(front.length / 2.0) - 1; unit_index > 0; --unit_index) {
            const unit = front[unit_index]
            if (unit)
                continue
            const unit_on_left = front[unit_index - 1]
            if (unit_on_left) {
                front[unit_index] = unit_on_left
                front[unit_index - 1] = null
                continue
            }
        }
        // Move units from right to center.
        for (let unit_index = Math.ceil(front.length / 2.0); unit_index < front.length - 1; ++unit_index) {
            const unit = front[unit_index]
            if (unit)
                continue
            const unit_on_right = front[unit_index + 1]
            if (unit_on_right) {
                front[unit_index] = unit_on_right
                front[unit_index + 1] = null
                continue
            }
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
