import { addValues } from 'definition_values'
import { getUnit, TestState, initState, initExpected, testCombat, getArmyTest } from './utils'
import { UnitType, UnitAttribute, TacticType, ValuesType, SideType } from 'types'
import { selectTactic, addToReserve } from 'managers/army'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('tactics', () => {
    const archer = addValues(getUnit(UnitType.Archers), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.2]])
    const defeatedHeavyInfantry = addValues(getUnit(UnitType.HeavyInfantry), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -1]])

    let state: TestState
    beforeEach(() => state = initState())

    it('increased casualties', () => {
      selectTactic(getArmyTest(state, SideType.A), TacticType.ShockAction)
      selectTactic(getArmyTest(state, SideType.B), TacticType.ShockAction)
      addToReserve(getArmyTest(state, SideType.A), [archer])
      addToReserve(getArmyTest(state, SideType.B), [archer])

      const rolls = [[3, 2]]
      const { attacker, defender } = initExpected(1, 3)

      attacker[1][15] = [archer.type, 965, 2.0760]
      attacker[3][15] = [archer.type, 900, 1.6020]

      defender[1][15] = [archer.type, 959, 2.0220]
      defender[3][15] = [archer.type, 883, 1.4400]

      testCombat(state, rolls, attacker, defender)
    })

    it('mixed casualties', () => {
      selectTactic(getArmyTest(state, SideType.A), TacticType.Skirmishing)
      selectTactic(getArmyTest(state, SideType.B), TacticType.ShockAction)
      addToReserve(getArmyTest(state, SideType.A), [archer])
      addToReserve(getArmyTest(state, SideType.B), [archer])

      const rolls = [[3, 2]]
      const { attacker, defender } = initExpected(1, 3)

      attacker[1][15] = [archer.type, 975, 2.0760]
      attacker[3][15] = [archer.type, 928, 1.5939]

      defender[1][15] = [archer.type, 971, 2.0220]
      defender[3][15] = [archer.type, 916, 1.4316]

      testCombat(state, rolls, attacker, defender)
    })

    it('counters and effectiveness', () => {
      selectTactic(getArmyTest(state, SideType.A), TacticType.Bottleneck)
      selectTactic(getArmyTest(state, SideType.B), TacticType.ShockAction)
      addToReserve(getArmyTest(state, SideType.A), [archer])
      addToReserve(getArmyTest(state, SideType.B), [archer])

      const rolls = [[0, 4]]
      const { attacker, defender } = initExpected(1, 3)

      attacker[1][15] = [archer.type, 961, 2.0112]
      attacker[3][15] = [archer.type, 888, 1.3643]

      defender[1][15] = [archer.type, 976, 2.1624]
      defender[3][15] = [archer.type, 932, 1.8181]

      testCombat(state, rolls, attacker, defender)
    })

    it('varying effectiveness (manpower)', () => {
      selectTactic(getArmyTest(state, SideType.A), TacticType.Bottleneck)
      selectTactic(getArmyTest(state, SideType.B), TacticType.ShockAction)
      addToReserve(getArmyTest(state, SideType.A), [archer, defeatedHeavyInfantry])
      addToReserve(getArmyTest(state, SideType.B), [archer])

      const rolls = [[5, 5]]
      const { attacker, defender } = initExpected(1, 3)

      attacker[1][15] = [archer.type, 957, 1.9626]
      attacker[3][15] = [archer.type, 878, 1.4171]

      defender[1][15] = [archer.type, 945, 1.8411]
      defender[3][15] = [archer.type, 842, 1.0512]

      testCombat(state, rolls, attacker, defender)
    })
  })
}

export default null
