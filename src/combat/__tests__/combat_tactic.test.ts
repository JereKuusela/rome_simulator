import { addValues } from 'definition_values'
import { getUnit, TestInfo, initInfo, setTactics, setCenterUnits, initSide, testCombat } from './utils'
import { UnitType, UnitAttribute, TacticType, ValuesType } from 'types'

describe('tactics', () => {
  const archer = addValues(getUnit(UnitType.Archers), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.2]])
  const heavy = addValues(getUnit(UnitType.HeavyInfantry), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.2]])
  
  let info: TestInfo
  beforeEach(() => { info = initInfo() })

  it('increased casualties', () => {
    setTactics(info, TacticType.ShockAction, TacticType.ShockAction)
    setCenterUnits(info, archer, archer)
    const rolls = [[3, 2]]
    const { attacker, defender } = initSide(3)

    attacker[0][15] = [archer.type, 971, 1.0650]
    attacker[1][15] = [archer.type, 943, 0.9516]
    attacker[2][15] = [archer.type, 916, 0.8564]

    defender[0][15] = [archer.type, 966, 1.0425]
    defender[1][15] = [archer.type, 933, 0.9067]
    defender[2][15] = [archer.type, 902, 0.7889]

    testCombat(info, rolls, attacker, defender)
  })

  it('mixed casualties', () => {
    setTactics(info, TacticType.Skirmishing, TacticType.ShockAction)
    setCenterUnits(info, archer, archer)
    const rolls = [[3, 2]]
    const { attacker, defender } = initSide(3)

    attacker[0][15] = [archer.type, 979, 1.0650]
    attacker[1][15] = [archer.type, 959, 0.9505]
    attacker[2][15] = [archer.type, 940, 0.8534]

    defender[0][15] = [archer.type, 976, 1.0425]
    defender[1][15] = [archer.type, 952, 0.9055]
    defender[2][15] = [archer.type, 930, 0.7858]

    testCombat(info, rolls, attacker, defender)
  })
  
  it('counters and effectiveness', () => {
    setTactics(info, TacticType.Bottleneck, TacticType.ShockAction)
    setCenterUnits(info, archer, archer)
    const rolls = [[0, 4]]
    const { attacker, defender } = initSide(3)

    attacker[0][15] = [archer.type, 968, 1.0380]
    attacker[1][15] = [archer.type, 937, 0.8922]
    attacker[2][15] = [archer.type, 906, 0.7600]

    defender[0][15] = [archer.type, 980, 1.1010]
    defender[1][15] = [archer.type, 961, 1.0180]
    defender[2][15] = [archer.type, 943, 0.9491]

    testCombat(info, rolls, attacker, defender)
  })
    
  it('varying effectiveness (manpower)', () => {
    setTactics(info, TacticType.Bottleneck, TacticType.ShockAction)
    setCenterUnits(info, archer, archer)
    info.army_a.frontline[0][0] = heavy
    const rolls = [[5, 5]]
    const { attacker, defender } = initSide(3)

    attacker[0][15] = [archer.type, 964, 1.0177]
    attacker[1][15] = [archer.type, 930, 0.8775]
    attacker[2][15] = [archer.type, 897, 0.7702]
    attacker[0][1] = [heavy.type, 1000, 1.2]
    attacker[1][2] = [heavy.type, 1000, 1.2]
    attacker[2][3] = [heavy.type, 1000, 1.2]

    defender[0][15] = [archer.type, 954, 0.9671]
    defender[1][15] = [archer.type, 910, 0.7765]
    defender[2][15] = [archer.type, 868, 0.6178]

    testCombat(info, rolls, attacker, defender)
  })
})


export default null
