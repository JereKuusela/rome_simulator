import { TestState, initCleanState, initExpected, getSettingsTest, createCohort, testCombatWithDefaultRolls, addToReserveTest, createArmyTest, setGeneralAttributeTest, getArmyTest, Expected, createDefeatedCohort, createStrongCohort, selectTerrainTest } from './utils'
import { UnitType, SideType, Setting, GeneralAttribute, CombatPhase, TerrainType } from 'types'


if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('dice', () => {
    const cohort = createCohort('Type' as UnitType)
    const weakCohort = createDefeatedCohort('Defeated' as UnitType)

    let expected: Expected[]
    let state: TestState
    beforeEach(() => {
      state = initCleanState()
      cohort.baseValues![CombatPhase.Fire] = { 'key': 1 }
      weakCohort.baseValues![CombatPhase.Fire] = { 'key': 1 }
      getSettingsTest(state)[Setting.Martial] = true
      getSettingsTest(state)[Setting.FireAndShock] = true
      expected = initExpected(1)
    })

    afterEach(() => {
      testCombatWithDefaultRolls(state, expected)
    })

    it('dice increase from 2 martial', () => {
      setGeneralAttributeTest(state, SideType.A, GeneralAttribute.Martial, 2, 0)
      addToReserveTest(state, SideType.A, [cohort])
      addToReserveTest(state, SideType.B, [cohort])
      expected[1].A.roll = 3
      expected[1].B.roll = 2
    })

    it('dice increase from 1 martial', () => {
      setGeneralAttributeTest(state, SideType.A, GeneralAttribute.Martial, 2, 0)
      setGeneralAttributeTest(state, SideType.B, GeneralAttribute.Martial, 1, 0)
      addToReserveTest(state, SideType.A, [cohort])
      addToReserveTest(state, SideType.B, [cohort])
      expected[1].A.roll = 2
      expected[1].B.roll = 2
    })

    it('dice increase from fire and shock pips', () => { 
      setGeneralAttributeTest(state, SideType.A, CombatPhase.Fire, 2, 0)
      setGeneralAttributeTest(state, SideType.B, CombatPhase.Fire, 1, 0)
      // No effect since fire phase.
      setGeneralAttributeTest(state, SideType.A, CombatPhase.Shock, 1, 0)
      setGeneralAttributeTest(state, SideType.B, CombatPhase.Shock, 2, 0)
      addToReserveTest(state, SideType.A, [cohort])
      addToReserveTest(state, SideType.B, [cohort])
      expected[1].A.roll = 3
      expected[1].B.roll = 2
    })
    
    it('dice decrease from terrain', () => {
      selectTerrainTest(state, TerrainType.Forest)
      selectTerrainTest(state, TerrainType.Naval, 1)
      addToReserveTest(state, SideType.A, [cohort])
      addToReserveTest(state, SideType.B, [cohort])
      expected[1].A.roll = -1
      expected[1].B.roll = 2
    })

    it('dice decrease from terrain (crossing ignored)', () => {
      setGeneralAttributeTest(state, SideType.A, GeneralAttribute.Maneuver, 1)
      selectTerrainTest(state, TerrainType.Forest)
      selectTerrainTest(state, TerrainType.Naval, 1)
      addToReserveTest(state, SideType.A, [cohort])
      addToReserveTest(state, SideType.B, [cohort])
      expected[1].A.roll = 1
      expected[1].B.roll = 2
    })

    it('attacker swapped', () => {
      createArmyTest(state, SideType.B, 2)
      addToReserveTest(state, SideType.A, [cohort])
      addToReserveTest(state, SideType.B, [weakCohort])
      addToReserveTest(state, SideType.B, [cohort], 1)
      selectTerrainTest(state, TerrainType.Forest)
      
      expected = initExpected(3)
      expected[3].B.leader = 1
      expected[3].A.roll = 2
      expected[3].B.roll = 1
      expected[3].B.defeated = [weakCohort.type]
      expected[3].attackerFlipped = true
    })
  })
}

export default null