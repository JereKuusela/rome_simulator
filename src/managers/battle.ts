import { Battle, TerrainType, SideType, CountryName, TerrainDefinition, Settings, Setting, UnitPreferences, CombatArmy, UnitType, ArmyName, SortedReserve, Reserve, Side, CombatSide, Army } from "types"
import { getCombatUnit, sortReserve } from "combat"

export const selectTerrain = (battle: Battle, index: number, terrain: TerrainType) => {
  battle.terrains[index] = terrain
}

export const setSeed = (battle: Battle, seed: number) => {
  battle.customSeed = seed || undefined
  battle.seed = seed
}
export const toggleRandomDice = (battle: Battle, sideType: SideType) => {
  const side = battle.sides[sideType]
  side.randomizeDice = !side.randomizeDice
}

export const setDice = (battle: Battle, sideType: SideType, dice: number) => {
  battle.sides[sideType].dice = dice
}

export const setPhaseDice = (battle: Battle, sideType: SideType, phase: number, dice: number) => {
  const rolls = battle.sides[sideType].rolls
  while (rolls.length - 1 < phase)
    rolls.push(0)
  rolls[phase] = dice
}

export const addParticipant = (battle: Battle, sideType: SideType, countryName: CountryName, armyName: ArmyName) => {
  battle.sides[sideType].participants.push({
    armyName,
    countryName,
    daysUntilBattle: 0
  })
}

export const deleteParticipant = (battle: Battle, sideType: SideType, index: number) => {
  battle.sides[sideType].participants.splice(index, 1)
}

export const selectParticipantCountry = (battle: Battle, sideType: SideType, index: number, countryName: CountryName, armyName: ArmyName) => {
  battle.sides[sideType].participants[index].countryName = countryName
  battle.sides[sideType].participants[index].armyName = armyName
}

export const selectParticipantArmy = (battle: Battle, sideType: SideType, index: number, armyName: ArmyName) => {
  battle.sides[sideType].participants[index].armyName = armyName
}

export const convertSide  = (side: Side, armies: CombatArmy[]): CombatSide => {
  return {
    alive: true,
    cohorts: {
      frontline: [],
      defeated: [],
      reserve: {
        front: [],
        flank: [],
        support: []
      }
    },
    flankRatio: 0,
    armies,
    generals: armies.map(army => army.general).sort((a, b) => a.priority - b.priority),
    type: side.type,
    results: {
      dailyMultiplier: 0,
      dice: 0,
      flankRatioBonus: 0,
      generalPips: 0,
      round: 0,
      tacticBonus: 0,
      terrainPips: 0,
      tacticStrengthDamageMultiplier: 0
    }
  }
}

export const convertArmy = (army: Army, enemyTypes: UnitType[], terrains: TerrainDefinition[], settings: Settings): CombatArmy => {
  const reserve = convertReserve(army.reserve, settings, terrains, enemyTypes, settings[Setting.CustomDeployment] ? army.unitPreferences : {} as UnitPreferences)
  return {
    reserve,
    flankSize: army.flankSize,
    general: {} as any,
    arrival: 0,
    strength: 0
  }
}

const convertReserve = (reserve: Reserve, settings: Settings, terrains: TerrainDefinition[], unitTypes: UnitType[], unitPreferences: UnitPreferences): SortedReserve => (
  sortReserve(reserve.map(cohort => getCombatUnit(settings, terrains, unitTypes, cohort)!), unitPreferences)
)
