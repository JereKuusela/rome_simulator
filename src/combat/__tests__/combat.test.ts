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
      const { attacker, defender } = initExpected(0, 5, 9)

      attacker[0][15] = [unit.type, 971, 2.1408]
      attacker[5][15] = [unit.type, 835, 1.1355]
      attacker[9][15] = [unit.type, 738, 0.6123]

      defender[0][15] = [unit.type, 980, 2.2272]
      defender[5][15] = [unit.type, 880, 1.5998]
      defender[9][15] = [unit.type, 773, 1.2266]

      testCombat(state, rolls, attacker, defender)
    })

    it('increased morale damage taken, terrain bonus and discipline', () => {
      const unitA = addValues(archer, ValuesType.Base, 'Test', [[UnitAttribute.Discipline, 0.045]])
      const unitD = addValues(archer, ValuesType.Base, 'Test', [[UnitAttribute.Discipline, 0.14], [TerrainType.Forest, 0.15]])
      selectTerrain(state.battle[Mode.Land], 0, TerrainType.Forest)
      addToReserveTest(state, SideType.A, [unitA])
      addToReserveTest(state, SideType.B, [unitD])

      const rolls = [[4, 4]]
      const { attacker, defender } = initExpected(0, 3)

      attacker[0][15] = [unitA.type, 949, 1.8337]
      attacker[3][15] = [unitA.type, 808, 0.6778]

      defender[0][15] = [unitD.type, 964, 2.0050]
      defender[3][15] = [unitD.type, 869, 1.3737]

      testCombat(state, rolls, attacker, defender)
    })

    it('reduced morale damage taken, offense/defense and experience', () => {
      const unitA = addValues(infantry, ValuesType.Base, 'Test', [[UnitAttribute.Offense, 0.1], [UnitAttribute.Defense, 0.15], [UnitAttribute.Experience, 0.0001]])
      const unitD = addValues(infantry, ValuesType.Base, 'Test', [[UnitAttribute.Offense, 0.05], [UnitAttribute.Defense, 0.05], [UnitAttribute.Experience, 0.0004]])
      addToReserveTest(state, SideType.A, [unitA])
      addToReserveTest(state, SideType.B, [unitD])

      const rolls = [[6, 1]]
      const { attacker, defender } = initExpected(1, 3)

      attacker[1][15] = [unitA.type, 957, 2.0019]
      attacker[3][15] = [unitA.type, 920, 1.8416]

      defender[1][15] = [unitD.type, 900, 1.6380]
      defender[3][15] = [unitD.type, 804, 1.1119]

      testCombat(state, rolls, attacker, defender)
    })

    it('versus damage and increased morale damage taken', () => {
      const unitA = addValues(cavalry, ValuesType.Base, 'Test', [])
      const unitD = addValues(archer, ValuesType.Base, 'Test', [])
      addToReserveTest(state, SideType.A, [unitA])
      addToReserveTest(state, SideType.B, [unitD])

      const rolls = [[4, 4]]
      const { attacker, defender } = initExpected(0, 2)

      attacker[0][15] = [unitA.type, 965, 2.0890]
      attacker[2][15] = [unitA.type, 901, 1.6944]

      defender[0][15] = [unitD.type, 952, 1.8600]
      defender[2][15] = [unitD.type, 860, 1.0161]

      testCombat(state, rolls, attacker, defender)
    })
  })
}

export default null
