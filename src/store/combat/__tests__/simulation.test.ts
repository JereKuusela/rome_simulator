import { UnitType, UnitCalc, } from '../../units'
import { setCenterUnits, getUnit, initInfo, TestInfo, getDefinitions, every_type } from './utils'
import { calculateWinRate, getRolls, monteCarot } from '../simulation'
import { getDefaultTactics } from '../../tactics'
import { CountryName } from '../../countries'
import { addValues, ValuesType } from '../../../base_definition'
import { toPercent } from '../../../formatters'

describe('1 vs 1', () => {
  const tactics = getDefaultTactics()
  const archer = getUnit(UnitType.Archers)
  const cavalry = getUnit(UnitType.LightCavalry)

  let info: TestInfo
  beforeEach(() => { info = initInfo() })

  it('no modifiers', () => {
    setCenterUnits(info, archer, cavalry)
    // Depth 3 (15 s): Attacker 0.0017 Defender 0.9588 Draws 0 Incomplete 0.0395
    // Depth 4 (110 s): Attacker 0.0018 Defender 0.9969 Draws 0 Incomplete 0.0013
    //calculateWinRate(getDefinitions(), { ...info.attacker, ...info.army_a, tactic: tactics[info.army_a.tactic], country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics[info.army_d.tactic], country: CountryName.Country2, general: 0 }, info.terrains, info.settings)
  })

  it('matchup', () => {
    return
    every_type.forEach(attacker => {
      every_type.forEach(defender => {
        setCenterUnits(info, getUnit(attacker), getUnit(defender))
        const result = calculateWinRate(getDefinitions(), { ...info.attacker, ...info.army_a, tactic: tactics[info.army_a.tactic], country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics[info.army_d.tactic], country: CountryName.Country2, general: 0 }, info.terrains, info.settings)
        console.log(attacker + ' ' + toPercent(result.wins_attacker) + ' ' + toPercent(result.wins_defender) + ' ' + defender)
      })
    }) 
  })

  it('monte', () => {
    setCenterUnits(info, archer, cavalry)
    // Iterations 10000: Attacker 0.0092 Defender 0.9907 Draws 0.0001
    //monteCarot(getDefinitions(), { ...info.attacker, ...info.army_a, tactic: tactics[info.army_a.tactic], country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics[info.army_d.tactic], country: CountryName.Country2, general: 0 }, info.terrains, info.settings)
  })

  it('first phase', () => {
    return
    const unit_a = addValues(archer, ValuesType.Base, 'Test', [[UnitCalc.Morale, -2.5]])
    setCenterUnits(info, unit_a, cavalry)
    const result = calculateWinRate(getDefinitions(), { ...info.attacker, ...info.army_a, tactic: tactics[info.army_a.tactic], country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics[info.army_d.tactic], country: CountryName.Country2, general: 0 }, info.terrains, info.settings)
    expect(result.wins_attacker).toEqual(0)
    expect(result.wins_defender).toEqual(1)
    expect(result.draws).toEqual(0)
    expect(result.incomplete).toEqual(0)
  })

  it('get rolls', () => {
    let ret = getRolls(0, 6)
    expect(ret.length).toEqual(1)
    expect(ret[0]).toEqual([1, 1])
    ret = getRolls(1, 6)
    expect(ret.length).toEqual(1)
    expect(ret[0]).toEqual([2, 1])
    ret = getRolls(36, 6)
    expect(ret.length).toEqual(2)
    expect(ret[0]).toEqual([1, 1])
    expect(ret[1]).toEqual([2, 1])
    ret = getRolls(72, 6)
    expect(ret.length).toEqual(2)
    expect(ret[0]).toEqual([1, 1])
    expect(ret[1]).toEqual([3, 1])
    ret = getRolls(73, 6)
    expect(ret.length).toEqual(2)
    expect(ret[0]).toEqual([2, 1])
    expect(ret[1]).toEqual([3, 1])
    ret = getRolls(73, 6)
    expect(ret.length).toEqual(2)
    expect(ret[0]).toEqual([2, 1])
    expect(ret[1]).toEqual([3, 1])
    ret = getRolls(1298, 6)
    expect(ret.length).toEqual(3)
    expect(ret[0]).toEqual([3, 1])
    expect(ret[1]).toEqual([1, 1])
    expect(ret[2]).toEqual([2, 1])
  })
})

export default null
