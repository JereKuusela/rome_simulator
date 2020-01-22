import { addValues } from 'definition_values'
import { getUnit, TestInfo, initInfo, setAttacker, setDefender, initSide, testCombat } from './utils'
import { UnitType, UnitCalc, Setting } from 'types'
import { ValuesType } from 'base_definition'

describe('targeting', () => {
  const archer = addValues(getUnit(UnitType.Archers), ValuesType.Modifier, 'Initial', [[UnitCalc.Morale, -0.2]])
  const light = addValues(getUnit(UnitType.LightCavalry), ValuesType.Modifier, 'Initial', [[UnitCalc.Morale, -0.2]])
  const heavy = addValues(getUnit(UnitType.HeavyCavalry), ValuesType.Modifier, 'Initial', [[UnitCalc.Morale, -0.2]])
  
  let info: TestInfo
  beforeEach(() => { info = initInfo() })

  it('main and flanks', () => {
    setAttacker(info, 14, archer)
    setAttacker(info, 15, archer)
    setDefender(info, 13, light)
    setDefender(info, 14, archer)
    setDefender(info, 15, archer)
    setDefender(info, 16, light)
    const rolls = [[5, 0]]
    const { attacker, defender } = initSide(1)

    attacker[0][14] = attacker[0][15] = [archer.type, 964, 0.9983]

    defender[0][13] = defender[0][16] = [light.type, 1000, 1.2]
    defender[0][14] = defender[0][15] = [archer.type, 964, 0.9982]

    testCombat(info, rolls, attacker, defender)
  })

  it('inner flank', () => {
    info.settings[Setting.FixTargeting] = false
    info.settings[Setting.DefenderAdvantage] = true
    
    setAttacker(info, 13, archer)
    setAttacker(info, 14, heavy)
    setAttacker(info, 15, heavy)
    setAttacker(info, 16, archer)
    setDefender(info, 13, archer)
    setDefender(info, 14, archer)
    setDefender(info, 15, archer)
    setDefender(info, 16, archer)
    const rolls = [[5, 5], [0, 6]]
    const { attacker, defender } = initSide(6)

    attacker[0] = attacker[1] = attacker[2] = attacker[3] = attacker[4] = null as any
    defender[0] = defender[1] = defender[2] = defender[3] = defender[4] = null as any

    attacker[5][13] = attacker[5][16] = [archer.type, 832, 0.5106]
    attacker[5][14] = attacker[5][15] = [heavy.type, 825, 0.7620]

    defender[5][14] = [archer.type, 778, 0.3212]
    defender[5][15] = [archer.type, 819, 0.4788]

    testCombat(info, rolls, attacker, defender)
  })

  it('inner flank (fixed)', () => {
    // Can't be tested in game.
    info.settings[Setting.FixTargeting] = true
    info.settings[Setting.DefenderAdvantage] = true
    
    setAttacker(info, 13, archer)
    setAttacker(info, 14, heavy)
    setAttacker(info, 15, heavy)
    setAttacker(info, 16, archer)
    setDefender(info, 13, archer)
    setDefender(info, 14, archer)
    setDefender(info, 15, archer)
    setDefender(info, 16, archer)
    const rolls = [[5, 5], [0, 6]]
    const { attacker, defender } = initSide(6)

    attacker[0] = attacker[1] = attacker[2] = attacker[3] = attacker[4] = null as any
    defender[0] = defender[1] = defender[2] = defender[3] = defender[4] = null as any

    attacker[5][13] = attacker[5][16] = [archer.type, 832, 0.5106]
    attacker[5][14] = attacker[5][15] = [heavy.type, 825, 0.7620]

    defender[5][14] = defender[5][15] = [archer.type, 798, 0.4]

    testCombat(info, rolls, attacker, defender)
  })
})


export default null
