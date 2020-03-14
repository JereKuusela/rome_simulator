import { TestInfo, initInfo, getUnit, testReinforcement } from './utils'
import { UnitType, Setting } from 'types'

import unit_preferences from './input/reinforcement/unit_preferences.txt'
import support_late_reinforcement from './input/reinforcement/support_late_reinforcement.txt'
import preferred_flank_size from './input/reinforcement/preferred_flank_size.txt'
import { loadInput } from './parser'

describe('reinforcement', () => {

  let info: TestInfo
  beforeEach(() => { info = initInfo() })



  it('works with unit prefrences', () => {
    loadInput(unit_preferences, info)
    const attacker = {
      front: Array(30).fill(UnitType.LightInfantry)
    }
    const defender = {
      front: [UnitType.SupplyTrain, UnitType.Archers],
      defeated: Array(30).fill(UnitType.SupplyTrain)
    }
    testReinforcement(1, info, attacker, defender)
  })


  it('reinforces support units only when nothing else is remaining', () => {
    loadInput(support_late_reinforcement, info)
    const attacker = {
      front: Array(30).fill(UnitType.HeavyCavalry)
    }
    const defender = {
      front: [UnitType.SupplyTrain],
      defeated: Array(31).fill(UnitType.Archers)
    }
    testReinforcement(3, info, attacker, defender)
  })


  it('works with preferred flank size', () => {
    loadInput(preferred_flank_size, info)
    // Tweak to defeat whole enemy line during the same turn.
    info.settings[Setting.MaxRoll] = 20
    const attacker = {
      front: Array(30).fill(UnitType.HeavyCavalry)
    }
    const defender = {
      front: Array(26).fill(UnitType.HeavyCavalry).concat(Array(4).fill(UnitType.LightCavalry)),
      reserve_front: Array(8).fill(UnitType.HeavyCavalry),
      reserve_flank: Array(52).fill(UnitType.LightCavalry),
      defeated: Array(2).fill(UnitType.LightCavalry).concat(Array(26).fill(UnitType.HeavyCavalry).concat(Array(2).fill(UnitType.LightCavalry)))
    }
    testReinforcement(3, info, attacker, defender)
  })
  /*it('a single unit', () => {
    setAttacker([UnitType.Archers])
    testReinforce(info, [UnitType.Archers])
  })
  it('both sides', () => {
    setAttacker([UnitType.Archers])
    setDefender([UnitType.Chariots])
    testReinforce(info, [UnitType.Archers], 0, [UnitType.Chariots], 0)
  })
  it('main front and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.Archers, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    fillDefender(UnitType.Archers)
    testReinforce(info, result)
  })
  it('flank only and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.Archers, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    testReinforce(info, result)
  })
  it('mixed field and default priorities, uneven', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.Archers, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    testReinforce(info, result)
  })
  it('mixed field and default priorities, even', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.Archers, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    testReinforce(info, result)
  })
  it('front priority', () => {
    info.army_a = { ...info.army_a, unit_preferences: getUnitPreferences(UnitType.Archers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.Archers, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    testReinforce(info, result)
  })
  it('back priority', () => {
    info.army_a = { ...info.army_a, unit_preferences: getUnitPreferences(null, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.Archers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    testReinforce(info, result)
  })
  it('flank priority', () => {
    info.army_a = { ...info.army_a, unit_preferences: getUnitPreferences(UnitType.Archers, UnitType.Archers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers, UnitType.Archers]
    testReinforce(info, result)
  })
  it('mixed priority', () => {
    info.army_a = { ...info.army_a, unit_preferences: getUnitPreferences(UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.HorseArchers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.HeavyInfantry, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.Archers]
    testReinforce(info, result)
  })
  it('flank size, inactive', () => {
    setFlankSizes(info, 5, 0)
    fillAttacker(UnitType.Archers)
    setAttacker([UnitType.HorseArchers])
    fillDefender(UnitType.Archers)
    const result = Array(30).fill(UnitType.Archers)
    testReinforce(info, result, 1)
  })
  it('flank size', () => {
    setFlankSizes(info, 5, 0)
    fillAttacker(UnitType.Archers)
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillDefender(UnitType.Archers)
    const result = Array(30).fill(UnitType.Archers)
    testReinforce(info, result, 3)
  })
  it('reduced combat width', () => {
    setFlankSizes(info, 2, 0)
    setCombatWidth(info, 5)
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(5).fill(UnitType.Archers)
    testReinforce(info, result, 3)

  })*/
})


export default null
