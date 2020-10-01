import { Battle, TerrainType, SideType, CountryName, Terrain, Settings, Setting, Army, UnitType, ArmyName, SideData, Side, ArmyDefinition, GeneralAttribute, Participant, CombatPhase } from 'types'
import { getCombatUnit, sortReserve } from 'combat'
import { map } from 'utils'

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

const getRow = (width: number) => Array(width).fill(null)

export const getDefaultCombatResults = () => ({
  dailyMultiplier: 0,
  dice: 0,
  generalPips: 0,
  round: 0,
  tacticBonus: 0,
  terrainPips: 0,
  tacticStrengthDamageMultiplier: 0
})

export const convertSide = (side: SideData, armies: Army[], settings: Settings): Side => {
  const width = settings[Setting.CombatWidth]
  return {
    armiesRemaining: true,
    isDefeated: false,
    cohorts: {
      frontline: settings[Setting.BackRow] ? [getRow(width), getRow(width)] : [getRow(width)],
      defeated: [],
      reserve: {
        front: [],
        flank: [],
        support: []
      },
      retreated: []
    },
    flankRatio: 0,
    armies,
    deployed: [],
    type: side.type,
    results: getDefaultCombatResults()
  }
}

export const convertArmy = (participantIndex: number, participant: Participant, army: ArmyDefinition, enemyTypes: UnitType[], terrains: Terrain[], settings: Settings): Army => {
  const reserve = army.reserve.map((cohort, index) => getCombatUnit(participant.countryName, participant.armyName, participantIndex, index, settings, terrains, enemyTypes, cohort))
  const unitProperties = map(army.unitDefinitions, unit => getCombatUnit(participant.countryName, participant.armyName, participantIndex, -1, settings, terrains, enemyTypes, unit).properties)
  const sorted = sortReserve(reserve, army.unitPreferences)
  return {
    reserve: sorted,
    flankRatio: army.flankRatio,
    unitProperties,
    flankSize: army.flankSize,
    arrival: participant.daysUntilBattle,
    leftFlank: army.flankSize,
    rightFlank: army.flankSize,
    priority: army.general.values[GeneralAttribute.Martial] + army.general.values[CombatPhase.Fire] + army.general.values[CombatPhase.Shock],
    tactic: army.general.tactic,
    unitPreferences: army.unitPreferences,
    general: army.general.values,
    participantIndex
  }
}

export const getLeadingArmy = (side: Side): Army | null => side.deployed.length ? side.deployed[0] : null

export const getParticipantName = (participant: Participant) => participant.countryName + ': ' + participant.armyName
export const getDay = (battle: Battle) => battle.days.length - 1
export const getStartingPhaseNumber = (battle: Battle) => battle.days.length ? battle.days[battle.days.length - 1].startingPhaseNumber : 0
export const getRound = (battle: Battle) => battle.days.length ? battle.days[battle.days.length - 1].round : -1
export const getAttacker = (battle: Battle) => battle.days.length ? battle.days[battle.days.length - 1].attacker : SideType.A