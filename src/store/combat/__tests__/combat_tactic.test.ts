import { TacticType } from '../../tactics'
import { TerrainType } from '../../terrains'
import { UnitType, UnitCalc } from '../../units'
import { addValues, ValuesType } from '../../../base_definition'
import { getUnit, TestInfo, initInfo } from './utils'

describe('1 vs 1', () => {
  const unit = addValues(getUnit(UnitType.Archers), ValuesType.Modifier, 'Initial', [[UnitCalc.Morale, -0.2]])
  
  let info: TestInfo
  beforeEach(() => { info = initInfo() })
})


export default null
