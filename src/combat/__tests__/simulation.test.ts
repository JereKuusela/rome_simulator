import { getUnit, TestInfo, initInfo, setCenterUnits, every_type } from "./utils"
import { UnitType, UnitCalc } from "types"
import { addValues } from "definition_values"
import { ValuesType } from "base_definition"

describe('1 vs 1', () => {
  const archer = getUnit(UnitType.Archers)
  const cavalry = getUnit(UnitType.LightCavalry)

  let info: TestInfo
  beforeEach(() => { info = initInfo() })

  it('simulation duel', () => {
    setCenterUnits(info, archer, cavalry)
    // Depth 3 (5 s): Attacker 0.0017 Defender 0.9588 Draws 0 Incomplete 0.0395
    // Depth 4 (6 s): Attacker 0.0067 Defender 0.9835 Draws 0 Incomplete 0.0098
    // Depth 5 (30 s): Attacker 0.0096 Defender 0.989 Draws 0.0001 Incomplete 0.0013
    //const result = calculateWinRate(simulation, () => {}, getDefinitions(), { ...info.attacker, ...info.army_a, tactic: tactics[info.army_a.tactic], country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics[info.army_d.tactic], country: CountryName.Country2, general: 0 }, info.terrains, info.settings)
    //console.log(result.wins_attacker + ' ' + result.wins_defender + ' ' + result.)
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

  it('first phase', () => {
    const unit_a = addValues(archer, ValuesType.Base, 'Test', [[UnitCalc.Morale, -2.5]])
    setCenterUnits(info, unit_a, cavalry)
    /*const result = calculateWinRate(getDefinitions(), { ...info.attacker, ...info.army_a, tactic: tactics[info.army_a.tactic], country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics[info.army_d.tactic], country: CountryName.Country2, general: 0 }, info.terrains, info.settings)
    expect(result.wins_attacker).toEqual(0)
    expect(result.wins_defender).toEqual(1)
    expect(result.draws).toEqual(0)
    expect(result.incomplete).toEqual(0)*/
  })
})

export default null
