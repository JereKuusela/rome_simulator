import { Battle, TerrainType, SideType, CountryName, TerrainDefinition, Settings, Setting, CombatArmy, UnitType, ArmyName, Side, CombatSide, Army, UnitAttribute, CombatGeneral, General, GeneralAttribute, Participant } from 'types'
import { getCombatUnit, sortReserve } from 'combat'
import { sum } from 'lodash'

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

export const convertSide = (side: Side, armies: CombatArmy[], settings: Settings): CombatSide => {
  return {
    alive: true,
    cohorts: {
      frontline: [Array(settings[Setting.CombatWidth]).fill(null)],
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

export const convertArmy = (participantIndex: number, participant: Participant, army: Army, enemyTypes: UnitType[], terrains: TerrainDefinition[], settings: Settings): CombatArmy => {
  const reserve = army.reserve.map((cohort, index) => getCombatUnit(participant.countryName, participant.armyName, participantIndex, index, settings, terrains, enemyTypes, cohort))
  const sorted = sortReserve(reserve, army.unitPreferences)
  return {
    reserve: sorted,
    flankSize: army.flankSize,
    general: convertGeneral(army, army.general),
    arrival: 0,
    strength: sum(reserve.map(cohort => cohort[UnitAttribute.Strength]))
  }
}

const convertGeneral = (army: Army, general: General): CombatGeneral => {
  return {
    leftFlank: army.flankSize,
    rightFlank: army.flankSize,
    priority: general.values[GeneralAttribute.Martial],
    tactic: general.tactic,
    unitPreferences: army.unitPreferences,
    values: general.values
  }
}
