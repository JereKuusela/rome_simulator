import { Battle, TerrainType, SideType, CountryName, ArmyForCombatConversion, TerrainDefinition, Settings, TacticCalc, Setting, UnitPreferences, CombatPhase, CombatParticipant, Cohorts, UnitType, CombatCohorts, ArmyName } from "types"
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

export const selectParticipantCountry = (battle: Battle, sideType: SideType, index: number, countryName: CountryName, armyName: ArmyName) => {
  battle.sides[sideType].participants[index].country = countryName
  battle.sides[sideType].participants[index].army = armyName
}

export const selectParticipantArmy = (battle: Battle, sideType: SideType, index: number, armyName: ArmyName) => {
  battle.sides[sideType].participants[index].army = armyName
}


export const convertParticipant = (side: SideType, army: ArmyForCombatConversion, enemy: ArmyForCombatConversion, terrains: TerrainDefinition[], settings: Settings): CombatParticipant => {
  const enemyTypes = toArr(enemy.definitions, unit => unit.type)
  const tacticCasualties = settings[Setting.Tactics] ? calculateValue(army.tactic, TacticCalc.Casualties) + calculateValue(enemy.tactic, TacticCalc.Casualties) : 0
  const cohorts = convertCohorts(army, settings, tacticCasualties, terrains, enemyTypes, settings[Setting.CustomDeployment] ? army.unitPreferences : {} as UnitPreferences)
  const generalPips = toObj(values(CombatPhase), phase => phase, phase => calculateGeneralPips(army.general, enemy.general, phase))
  const terrainPips = getTerrainPips(terrains, side, army.general, enemy.general)
  return {
    cohorts,
    dice: 0,
    flankRatio: army.flankRatio,
    flank: army.flankSize,
    tactic: army.tactic!,
    terrainPips,
    generalPips,
    rollPips: toObj(values(CombatPhase), phase => phase, phase => generalPips[phase] + terrainPips + settings[Setting.BasePips]),
    unitPreferences: army.unitPreferences,
    unitTypes: map(army.definitions, unit => getUnitDefinition(settings, terrains, enemyTypes, { ...unit, id: -1 })),
    tacticBonus: 0.0,
    round: 0,
    flankRatioBonus: 0.0,
    definitions: army.definitions,
    alive: true
  }
}

const convertCohorts = (cohorts: Cohorts, settings: Settings, casualtiesMultiplier: number, terrains: TerrainDefinition[], unitTypes: UnitType[], unitPreferences: UnitPreferences): CombatCohorts => ({
  frontline: cohorts.frontline.map(row => row.map(cohort => getCombatUnit(settings, casualtiesMultiplier, terrains, unitTypes, cohort))),
  reserve: sortReserve(cohorts.reserve.map(cohort => getCombatUnit(settings, casualtiesMultiplier, terrains, unitTypes, cohort)!), unitPreferences),
  defeated: cohorts.defeated.map(cohort => getCombatUnit(settings, casualtiesMultiplier, terrains, unitTypes, cohort)!),
  leftFlank: 0,
  rightFlank: 0
})
