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
      const { expectedA, expectedB } = initExpected(1, 3)

      expectedA[1].front = [[archer.type, 0.965, 2.0760]]
      expectedA[3].front = [[archer.type, 0.900, 1.6020]]

      expectedB[1].front = [[archer.type, 0.959, 2.0220]]
      expectedB[3].front = [[archer.type, 0.883, 1.4400]]

      testCombat(state, rolls, expectedA, expectedB)
    })

    it('mixed casualties', () => {
      selectTactic(getArmyTest(state, SideType.A), TacticType.Skirmishing)
      selectTactic(getArmyTest(state, SideType.B), TacticType.ShockAction)
      addToReserve(getArmyTest(state, SideType.A), [archer])
      addToReserve(getArmyTest(state, SideType.B), [archer])

      const rolls = [[3, 2]]
      const { expectedA, expectedB } = initExpected(1, 3)

      expectedA[1].front = [[archer.type, 0.975, 2.0760]]
      expectedA[3].front = [[archer.type, 0.928, 1.5939]]

      expectedB[1].front = [[archer.type, 0.971, 2.0220]]
      expectedB[3].front = [[archer.type, 0.916, 1.4316]]

      testCombat(state, rolls, expectedA, expectedB)
    })

    it('counters and effectiveness', () => {
      selectTactic(getArmyTest(state, SideType.A), TacticType.Bottleneck)
      selectTactic(getArmyTest(state, SideType.B), TacticType.ShockAction)
      addToReserve(getArmyTest(state, SideType.A), [archer])
      addToReserve(getArmyTest(state, SideType.B), [archer])

      const rolls = [[0, 4]]
      const { expectedA, expectedB } = initExpected(1, 3)

      expectedA[1].front = [[archer.type, 0.961, 2.0112]]
      expectedA[3].front = [[archer.type, 0.888, 1.3643]]

      expectedB[1].front = [[archer.type, 0.976, 2.1624]]
      expectedB[3].front = [[archer.type, 0.932, 1.8181]]

      testCombat(state, rolls, expectedA, expectedB)
    })

    it('varying effectiveness (manpower)', () => {
      selectTactic(getArmyTest(state, SideType.A), TacticType.Bottleneck)
      selectTactic(getArmyTest(state, SideType.B), TacticType.ShockAction)
      addToReserve(getArmyTest(state, SideType.A), [archer, defeatedHeavyInfantry])
      addToReserve(getArmyTest(state, SideType.B), [archer])

      const rolls = [[5, 5]]
      const { expectedA, expectedB } = initExpected(1, 3)

      expectedA[1].front = [[archer.type, 0.957, 1.9626]]
      expectedA[1].defeated = [defeatedHeavyInfantry.type]
      expectedA[3].front = [[archer.type, 0.878, 1.4171]]
      expectedA[3].defeated = [defeatedHeavyInfantry.type]

      expectedB[1].front = [[archer.type, 0.945, 1.8411]]
      expectedB[3].front = [[archer.type, 0.842, 1.0512]]

      testCombat(state, rolls, expectedA, expectedB)
    })
  })
}

export default null
