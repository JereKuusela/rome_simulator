import { battle } from '../combat'
import { List } from 'immutable'
import { getInitialArmy, getInitialTerrains, Participant } from '../types'
import { getDefaultDefinitions as getDefaultTacticDefinitions, TacticType } from '../../tactics'
import { getDefaultDefinitions as getDefaultTerrainDefinitions, TerrainType, } from '../../terrains'
import { getDefaultDefinitions as getDefaultUnitDefinitions, UnitType, UnitCalc } from '../../units'

describe('1 vs 1', () => {
  // Test case with two of all units except of Chariot
  it('works', () => {
    // No preference: Unit order by build cost: Elephant, Heavy Cav, Heavy Inf, Light Inf, Archer, Horse Archer, Camel, Light Cav
    // Setting flank moves the unit before Horse Archer.
    // Setting front moves the unit before Elephant.
    // Setting flank overrides front. Front overrides second.
    // Setting secondary moves the unit before Horse Archer (or before flank), probably just lowest priority for front.
    // Size doesnt seem to have any effect!
    // Order of same units based on list (top first).
    // Flank size= Amount of flanking units or how many more units. 20 vs 10 -> flank size 5 unless more than 10 flankers.

  
  })
})


export default null
