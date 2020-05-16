import { Battle, TerrainType, SideType, CountryName, Terrain, Settings, Setting, Army, UnitType, ArmyName, SideData, Side, ArmyDefinition, UnitAttribute, General, GeneralDefinition, GeneralAttribute, Participant } from 'types'
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

export const setDaysUntilBattle = (battle: Battle, sideType: SideType, index: number, daysUntilBattle: number) => {
  battle.sides[sideType].participants[index].daysUntilBattle = daysUntilBattle
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

export const convertSide = (side: SideData, armies: Army[], settings: Settings): Side => {
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
    deployedArmies: [],
    generals: armies.map(army => army.general).sort((a, b) => b.priority - a.priority),
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

export const convertArmy = (participantIndex: number, participant: Participant, army: ArmyDefinition, enemyTypes: UnitType[], terrains: Terrain[], settings: Settings): Army => {
  const reserve = army.reserve.map((cohort, index) => getCombatUnit(participant.countryName, participant.armyName, participantIndex, index, settings, terrains, enemyTypes, cohort))
  const sorted = sortReserve(reserve, army.unitPreferences)
  return {
    reserve: sorted,
    flankSize: army.flankSize,
    general: convertGeneral(army, army.general, participant.daysUntilBattle),
    arrival: participant.daysUntilBattle,
    strength: sum(reserve.map(cohort => cohort[UnitAttribute.Strength]))
  }
}

const convertGeneral = (army: ArmyDefinition, general: GeneralDefinition, arrival: number): General => {
  return {
    leftFlank: army.flankSize,
    rightFlank: army.flankSize,
    priority: general.values[GeneralAttribute.Martial],
    tactic: general.tactic,
    unitPreferences: army.unitPreferences,
    values: general.values,
    arrival
  }
}

export const getLeadingGeneral = (side: Side): General | null => side.generals.length ? side.generals[0] : null

export const getDay = (battle: Battle) => battle.days.length - 1
export const getStartingPhaseNumber = (battle: Battle) => battle.days.length ? battle.days[battle.days.length - 1].startingPhaseNumber : 0
export const getRound = (battle: Battle) => battle.days.length ? battle.days[battle.days.length - 1].round : -1