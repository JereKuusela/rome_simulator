import { UnitType, UnitCalc, } from '../../units'
import { setCenterUnits, getUnit, initInfo, TestInfo, getDefinitions, every_type } from './utils'
import { calculateWinRate, getRolls, monteCarot, spread } from '../simulation'
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

  it('simulation duel', () => {
    setCenterUnits(info, archer, cavalry)
    // Depth 3 (5 s): Attacker 0.0017 Defender 0.9588 Draws 0 Incomplete 0.0395
    // Depth 4 (6 s): Attacker 0.0067 Defender 0.9835 Draws 0 Incomplete 0.0098
    // Depth 5 (30 s): Attacker 0.0096 Defender 0.989 Draws 0.0001 Incomplete 0.0013
    //calculateWinRate(getDefinitions(), { ...info.attacker, ...info.army_a, tactic: tactics[info.army_a.tactic], country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics[info.army_d.tactic], country: CountryName.Country2, general: 0 }, info.terrains, info.settings)
  })

  it('matchup', () => {
    return
    every_type.forEach((attacker, index_a) => {
      every_type.forEach((defender, index_d) => {
        if (index_d < index_a)
          return
        setCenterUnits(info, getUnit(attacker), getUnit(defender))
        /*const result = calculateWinRate(getDefinitions(), { ...info.attacker, ...info.army_a, tactic: tactics[info.army_a.tactic], country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics[info.army_d.tactic], country: CountryName.Country2, general: 0 }, info.terrains, info.settings)
        console.log(attacker + ' ' + toPercent(result.wins_attacker) + ' ' + toPercent(result.wins_defender) + ' ' + defender)*/
      })
    })
  })

  it('monte', () => {
    setCenterUnits(info, archer, cavalry)
    // Iterations 10000: Attacker 0.0092 Defender 0.9907 Draws 0.0001
    //monteCarot(getDefinitions(), { ...info.attacker, ...info.army_a, tactic: tactics[info.army_a.tactic], country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics[info.army_d.tactic], country: CountryName.Country2, general: 0 }, info.terrains, info.settings)
  })

  it('first phase', () => {
    const unit_a = addValues(archer, ValuesType.Base, 'Test', [[UnitCalc.Morale, -2.5]])
    setCenterUnits(info, unit_a, cavalry)
    /*const result = calculateWinRate(getDefinitions(), { ...info.attacker, ...info.army_a, tactic: tactics[info.army_a.tactic], country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics[info.army_d.tactic], country: CountryName.Country2, general: 0 }, info.terrains, info.settings)
    expect(result.wins_attacker).toEqual(0)
    expect(result.wins_defender).toEqual(1)
    expect(result.draws).toEqual(0)
    expect(result.incomplete).toEqual(0)*/
  })

  it('spreads  and rolls', () => {
    let indexes = spread(3 + 72, 36, 3)
    expect(indexes.length).toEqual(35)
    let index = 0
    for (let i = 1; i <= 6; i++) {
      for (let j = 1; j <= 6; j++) {
        if (i === 1 && j === i)
          continue
        let ret = getRolls(indexes[index], 6)
        expect(ret.length).toEqual(4)
        expect(ret[0]).toEqual([4, 1])
        expect(ret[1]).toEqual([3, 1])
        expect(ret[2]).toEqual([1, 1])
        expect(ret[3]).toEqual([j, i])
        index++
      }
    }
  })
})

export default null
