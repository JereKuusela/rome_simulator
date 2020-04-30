import { Battle, TerrainType, SideType, CountryName, ArmyForCombatConversion, TerrainDefinition, Settings, TacticCalc, Setting, UnitPreferences, CombatPhase, CombatParticipant, Cohorts, UnitType, CombatCohorts, ArmyName } from "types"
import { forEach, toArr, toObj, values, map } from "utils"
import { calculateGeneralPips, getTerrainPips, getUnitDefinition, getCombatUnit, sortReserve } from "combat"
import { calculateValue } from "definition_values"

export const selectTerrain = (battle: Battle, index: number, terrain: TerrainType) => {
  battle.terrains[index] = terrain
}

export const setSeed = (battle: Battle, seed: number) => {
  battle.custom_seed = seed || undefined
  battle.seed = seed
}

export const undo = (battle: Battle, steps: number) => {
  for (let step = 0; step < steps && battle.round > -1; ++step) {
    let seed: number = battle.seed
    if (battle.round < 2)
      seed = battle.custom_seed ? battle.custom_seed : 0
    forEach(battle.sides, side => {
      side.rounds.pop()
    })
    battle.round--
    battle.seed = seed
    battle.fight_over = false
    battle.timestamp = new Date().getMilliseconds()
  }
}

export const toggleRandomDice = (battle: Battle, sideType: SideType) => {
  const side = battle.sides[sideType]
  side.randomize_dice = !side.randomize_dice
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
  const enemy_types = toArr(enemy.definitions, unit => unit.type)
  const tactic_casualties = settings[Setting.Tactics] ? calculateValue(army.tactic, TacticCalc.Casualties) + calculateValue(enemy.tactic, TacticCalc.Casualties) : 0
  const cohorts = convertCohorts(army, settings, tactic_casualties, terrains, enemy_types, settings[Setting.CustomDeployment] ? army.unit_preferences : {} as UnitPreferences)
  const general_pips = toObj(values(CombatPhase), phase => phase, phase => calculateGeneralPips(army.general, enemy.general, phase))
  const terrain_pips = getTerrainPips(terrains, side, army.general, enemy.general)
  return {
    cohorts,
    dice: 0,
    flank_ratio: army.flank_ratio,
    flank: army.flank_size,
    tactic: army.tactic!,
    terrain_pips,
    general_pips,
    roll_pips: toObj(values(CombatPhase), phase => phase, phase => general_pips[phase] + terrain_pips + settings[Setting.BasePips]),
    unit_preferences: army.unit_preferences,
    unit_types: map(army.definitions, unit => getUnitDefinition(settings, terrains, enemy_types, { ...unit, id: -1 })),
    tactic_bonus: 0.0,
    round: 0,
    flank_ratio_bonus: 0.0,
    definitions: army.definitions,
    alive: true
  }
}

const convertCohorts = (cohorts: Cohorts, settings: Settings, casualties_multiplier: number, terrains: TerrainDefinition[], unit_types: UnitType[], unit_preferences: UnitPreferences): CombatCohorts => ({
  frontline: cohorts.frontline.map(row => row.map(cohort => getCombatUnit(settings, casualties_multiplier, terrains, unit_types, cohort))),
  reserve: sortReserve(cohorts.reserve.map(cohort => getCombatUnit(settings, casualties_multiplier, terrains, unit_types, cohort)!), unit_preferences),
  defeated: cohorts.defeated.map(cohort => getCombatUnit(settings, casualties_multiplier, terrains, unit_types, cohort)!),
  left_flank: 0,
  right_flank: 0
})
