import { Battle, TerrainType, SideType, CountryName, ArmyForCombatConversion, TerrainDefinition, Settings, TacticCalc, Setting, UnitPreferences, CombatPhase, CombatParticipant, UnitType, CombatCohorts, ArmyName, SortedReserve, Reserve, Side, CombatSide } from "types"
import { toArr, toObj, values, map } from "utils"
import { calculateGeneralPips, getTerrainPips, getUnitDefinition, getCombatUnit, sortReserve } from "combat"
import { calculateValue } from "definition_values"

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

export const convertSide  = (side: Side): CombatSide => {
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
    dice: 0,
    flankRatio: 0,
    flankRatioBonus: 0,
    participants: [],
    round: 0,
    tacticBonus: 0,
    generals: [],
    type: side.type
  }
}

export const convertParticipant = (side: SideType, army: ArmyForCombatConversion, enemy: ArmyForCombatConversion, terrains: TerrainDefinition[], settings: Settings): CombatParticipant => {
  const enemyTypes = toArr(enemy.definitions, unit => unit.type)
  const tacticCasualties = settings[Setting.Tactics] ? calculateValue(army.tactic, TacticCalc.Casualties) + calculateValue(enemy.tactic, TacticCalc.Casualties) : 0
  const reserve = convertReserve(army.reserve, settings, tacticCasualties, terrains, enemyTypes, settings[Setting.CustomDeployment] ? army.unitPreferences : {} as UnitPreferences)
  return {
    reserve,
    flankSize: army.flankSize,
    general: {} as any,
    definitions: army.definitions,
    arrival: 0,
    strength: 0
  }
}

const convertReserve = (reserve: Reserve, settings: Settings, casualtiesMultiplier: number, terrains: TerrainDefinition[], unitTypes: UnitType[], unitPreferences: UnitPreferences): SortedReserve => (
  sortReserve(reserve.map(cohort => getCombatUnit(settings, casualtiesMultiplier, terrains, unitTypes, cohort)!), unitPreferences)
)
