import { addValues } from 'definition_values'
import { getUnit, TestState, initState, initSide, testCombat, addToReserveTest } from './utils'
import { UnitType, UnitAttribute, TerrainType, ValuesType, SideType, Mode } from 'types'
import { addToReserve } from 'managers/army'
import { selectTerrain } from 'managers/battle'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('1 vs 1', () => {

    const archer = addValues(getUnit(UnitType.Archers), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.2]])
    const infantry = addValues(getUnit(UnitType.LightInfantry), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.25]])
    const cavalry = addValues(getUnit(UnitType.LightCavalry), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.2]])

    let state: TestState
    beforeEach(() => state = initState(true))

    it('no modifiers', () => {
      const unit = addValues(archer, ValuesType.Base, 'Test', [[UnitAttribute.MoraleDamageTaken, -0.25]])
      addToReserveTest(state, SideType.A, [unit])
      addToReserveTest(state, SideType.B, [unit])

      const rolls = [[0, 2], [3, 2]]
      const { attacker, defender } = initSide(10)

      attacker[0][15] = [unit.type, 976, 1.0920]
      attacker[1][15] = [unit.type, 952, 0.9921]
      attacker[2][15] = [unit.type, 929, 0.8993]
      attacker[3][15] = [unit.type, 906, 0.8129]
      attacker[4][15] = [unit.type, 883, 0.7321]
      attacker[5][15] = [unit.type, 861, 0.6562]
      attacker[6][15] = [unit.type, 840, 0.5878]
      attacker[7][15] = [unit.type, 819, 0.5260]
      attacker[8][15] = [unit.type, 798, 0.4697]
      attacker[9][15] = [unit.type, 778, 0.4184]

      defender[0][15] = [unit.type, 984, 1.1280]
      defender[1][15] = [unit.type, 968, 1.0640]
      defender[2][15] = [unit.type, 953, 1.0073]
      defender[3][15] = [unit.type, 938, 0.9572]
      defender[4][15] = [unit.type, 923, 0.9130]
      defender[5][15] = [unit.type, 899, 0.8450]
      defender[6][15] = [unit.type, 874, 0.7857]
      defender[7][15] = [unit.type, 851, 0.7338]
      defender[8][15] = [unit.type, 828, 0.6886]
      defender[9][15] = [unit.type, 806, 0.6492]

      testCombat(state, rolls, attacker, defender)
    })

    it('increased morale damage taken, terrain bonus and discipline', () => {
      const unitA = addValues(archer, ValuesType.Base, 'Test', [[UnitAttribute.Discipline, 0.045]])
      const unitD = addValues(archer, ValuesType.Base, 'Test', [[UnitAttribute.Discipline, 0.14], [TerrainType.Forest, 0.15]])
      selectTerrain(state.battle[Mode.Land], 0, TerrainType.Forest)
      addToReserveTest(state, SideType.A, [unitA])
      addToReserveTest(state, SideType.B, [unitD])

      const rolls = [[4, 4]]
      const { attacker, defender } = initSide(4)

      attacker[0][15] = [unitA.type, 958, 0.9644]
      attacker[1][15] = [unitA.type, 917, 0.7668]
      attacker[2][15] = [unitA.type, 877, 0.5984]
      attacker[3][15] = [unitA.type, 839, 0.4521]

      defender[0][15] = [unitD.type, 970, 1.0353]
      defender[1][15] = [unitD.type, 942, 0.9086]
      defender[2][15] = [unitD.type, 915, 0.8121]
      defender[3][15] = [unitD.type, 890, 0.7401]

      testCombat(state, rolls, attacker, defender)
    })

    it('reduced morale damage taken, offense/defense and experience', () => {
      const unitA = addValues(infantry, ValuesType.Base, 'Test', [[UnitAttribute.Offense, 0.1], [UnitAttribute.Defense, 0.15], [UnitAttribute.Experience, 0.0001]])
      const unitD = addValues(infantry, ValuesType.Base, 'Test', [[UnitAttribute.Offense, 0.05], [UnitAttribute.Defense, 0.05], [UnitAttribute.Experience, 0.0004]])
      addToReserveTest(state, SideType.A, [unitA])
      addToReserveTest(state, SideType.B, [unitD])

      const rolls = [[6, 1]]
      const { attacker, defender } = initSide(4)

      attacker[0] = null as any
      attacker[1][15] = [unitA.type, 964, 1.0199]
      attacker[2][15] = [unitA.type, 948, 0.9796]
      attacker[3][15] = [unitA.type, 932, 0.9462]

      defender[0] = null as any
      defender[1][15] = [unitD.type, 916, 0.8684]
      defender[2][15] = [unitD.type, 876, 0.7521]
      defender[3][15] = [unitD.type, 836, 0.6424]

      testCombat(state, rolls, attacker, defender)
    })

    it('versus damage and increased morale damage taken', () => {
      const unitA = addValues(cavalry, ValuesType.Base, 'Test', [])
      const unitD = addValues(archer, ValuesType.Base, 'Test', [])
      addToReserveTest(state, SideType.A, [unitA])
      addToReserveTest(state, SideType.B, [unitD])

      const rolls = [[4, 4]]
      const { attacker, defender } = initSide(3)

      attacker[0][15] = [unitA.type, 971, 1.0704]
      attacker[1][15] = [unitA.type, 943, 0.9693]
      attacker[2][15] = [unitA.type, 917, 0.8917]

      defender[0][15] = [unitD.type, 960, 0.9750]
      defender[1][15] = [unitD.type, 921, 0.7800]
      defender[2][15] = [unitD.type, 883, 0.6086]

      testCombat(state, rolls, attacker, defender)
    })
  })
}

export default null
