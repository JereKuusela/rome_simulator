import { Battle, TerrainType, Side, CountryName, ArmyForCombatConversion, Terrain, Settings, TacticCalc, Setting, UnitPreferences, CombatPhase, CombatParticipant } from "types"
import { forEach, toArr, toObj, values, map } from "utils"
import { convertCohorts, calculateGeneralPips, getTerrainPips, getUnitDefinition } from "combat"
import { calculateValue } from "definition_values"

export const selectTerrain = (battle: Battle, index: number, terrain: TerrainType) => {
  battle.terrains[index] = terrain
}

export const invalidate = (battle: Battle) => {
  battle.outdated = true
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
    forEach(battle.participants, value => {
      value.rounds.pop()
    })
    battle.round--
    battle.seed = seed
    battle.fight_over = false
    battle.timestamp = new Date().getMilliseconds()
  }
}

export const toggleRandomDice = (battle: Battle, side: Side) => {
  const participant = battle.participants[side]
  participant.randomize_dice = !participant.randomize_dice
}

export const setDice = (battle: Battle, side: Side, dice: number) => {
  battle.participants[side].dice = dice
}

export const setPhaseDice = (battle: Battle, side: Side, phase: number, dice: number) => {
  const rolls = battle.participants[side].rolls
  while (rolls.length - 1 < phase)
    rolls.push(0)
  rolls[phase] = dice
}

export const selectArmy = (battle: Battle, side: Side, name: CountryName) => {
  battle.participants[side].country = name
}


export const convertParticipant = (side: Side, army: ArmyForCombatConversion, enemy: ArmyForCombatConversion, terrains: Terrain[], settings: Settings): CombatParticipant => {
  const enemy_types = toArr(enemy.definitions, unit => unit.type)
  const tactic_casualties = calculateValue(army.tactic, TacticCalc.Casualties) + calculateValue(enemy.tactic, TacticCalc.Casualties)
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
    definitions: army.definitions
  }
}
