import { addValues } from 'definition_values'
import { getUnit, TestState, initState, initExpected, testCombat, addToReserveTest } from './utils'
import { UnitType, UnitAttribute, TerrainType, ValuesType, SideType, Mode } from 'types'
import { addToReserve } from 'managers/army'
import { selectTerrain } from 'managers/battle'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('1 vs 1', () => {

    const archer = addValues(getUnit(UnitType.Archers), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.2]])
    const infantry = addValues(getUnit(UnitType.LightInfantry), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.25]])
    const cavalry = addValues(getUnit(UnitType.LightCavalry), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.2]])

    let state: TestState
    beforeEach(() => state = initState())

    it('no modifiers', () => {
      const unit = addValues(archer, ValuesType.Base, 'Test', [[UnitAttribute.MoraleDamageTaken, -0.25]])
      addToReserveTest(state, SideType.A, [unit])
      addToReserveTest(state, SideType.B, [unit])

      const rolls = [[0, 2], [3, 2]]
      const { expectedA, expectedB } = initExpected(1, 6, 10)

      expectedA[1].front = [[unit.type, 0.971, 2.1408]]
      expectedA[6].front = [[unit.type, 0.835, 1.1355]]
      expectedA[10].front = [[unit.type, 0.738, 0.6123]]

      expectedB[1].front = [[unit.type, 0.980, 2.2272]]
      expectedB[6].front = [[unit.type, 0.880, 1.5998]]
      expectedB[10].front = [[unit.type, 0.773, 1.2266]]

      testCombat(state, rolls, expectedA, expectedB)
    })

    it('increased morale damage taken, terrain bonus and discipline', () => {
      const unitA = addValues(archer, ValuesType.Base, 'Test', [[UnitAttribute.Discipline, 0.045]])
      const unitD = addValues(archer, ValuesType.Base, 'Test', [[UnitAttribute.Discipline, 0.14], [TerrainType.Forest, 0.15]])
      selectTerrain(state.battle[Mode.Land], 0, TerrainType.Forest)
      addToReserveTest(state, SideType.A, [unitA])
      addToReserveTest(state, SideType.B, [unitD])

      const rolls = [[4, 4]]
      const { expectedA, expectedB } = initExpected(1, 4)

      expectedA[1].front = [[unitA.type, 0.949, 1.8337]]
      expectedA[4].front = [[unitA.type, 0.808, 0.6778]]

      expectedB[1].front = [[unitD.type, 0.964, 2.0050]]
      expectedB[4].front = [[unitD.type, 0.869, 1.3737]]

      testCombat(state, rolls, expectedA, expectedB)
    })

    it('reduced morale damage taken, offense/defense and experience', () => {
      const unitA = addValues(infantry, ValuesType.Base, 'Test', [[UnitAttribute.Offense, 0.1], [UnitAttribute.Defense, 0.15], [UnitAttribute.Experience, 0.0001]])
      const unitD = addValues(infantry, ValuesType.Base, 'Test', [[UnitAttribute.Offense, 0.05], [UnitAttribute.Defense, 0.05], [UnitAttribute.Experience, 0.0004]])
      addToReserveTest(state, SideType.A, [unitA])
      addToReserveTest(state, SideType.B, [unitD])

      const rolls = [[6, 1]]
      const { expectedA, expectedB } = initExpected(2, 4)

      expectedA[2].front = [[unitA.type, 0.957, 2.0019]]
      expectedA[4].front = [[unitA.type, 0.920, 1.8416]]

      expectedB[2].front = [[unitD.type, 0.900, 1.6380]]
      expectedB[4].front = [[unitD.type, 0.804, 1.1119]]

      testCombat(state, rolls, expectedA, expectedB)
    })

    it('versus damage and increased morale damage taken', () => {
      const unitA = addValues(cavalry, ValuesType.Base, 'Test', [])
      const unitD = addValues(archer, ValuesType.Base, 'Test', [])
      addToReserveTest(state, SideType.A, [unitA])
      addToReserveTest(state, SideType.B, [unitD])

      const rolls = [[4, 4]]
      const { expectedA, expectedB } = initExpected(1, 3)

      expectedA[1].front = [[unitA.type, 0.965, 2.0890]]
      expectedA[3].front = [[unitA.type, 0.901, 1.6944]]

      expectedB[1].front = [[unitD.type, 0.952, 1.8600]]
      expectedB[3].front = [[unitD.type, 0.860, 1.0161]]

      testCombat(state, rolls, expectedA, expectedB)
    })
  })
}

export default null
