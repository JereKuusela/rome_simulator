import * as battleManager from 'managers/battle'
import type { AppState } from 'reducers'
import { ArmyName, ArmyPart, CountryName, Mode, SideType } from 'types'
import { ArmyKey, useSelector } from './utils'
import { getParticipantName } from 'managers/battle'
import { getArmies } from './countries'
import { getCohorts, getParticipants, getSide, getSideData } from './battle'
import { getArmyPart } from 'army_utils'
import { iterateCohorts } from 'combat/combat_utils'
import { getSelectedParticipantIndex } from './ui'

export const getArmyData = (state: AppState, key: ArmyKey) => getArmies(state, key.countryName)[key.armyName]

export const getParticipant = (state: AppState, sideType: SideType, index?: number, mode?: Mode) => {
  index = index ?? getSelectedParticipantIndex(state, sideType)
  return getParticipants(state, sideType, mode)[index]
}

export const getLeadingArmy = (state: AppState, sideType: SideType) => {
  const side = getSide(state, sideType)
  return battleManager.getLeadingArmy(side)
}

export const getCohort = (state: AppState, side: SideType, part: ArmyPart, row: number, column: number) =>
  getArmyPart(getCohorts(state, side), part)[row][column]

export const getCohortForEachRound = (state: AppState, side: SideType, participantIndex: number, index: number) => {
  const rounds = getSideData(state, side).days
  return rounds.map(side => {
    let result = null
    iterateCohorts(side.cohorts, true, cohort => {
      if (cohort && cohort.properties.participantIndex === participantIndex && cohort.properties.index === index)
        result = cohort
    })
    return result
  })
}

export const useParticipant = (type: SideType, index?: number, mode?: Mode) =>
  useSelector(state => getParticipant(state, type, index, mode))

export const useParticipantName = (type: SideType, index: number, mode?: Mode) =>
  useSelector(state => getParticipantName(getParticipant(state, type, index, mode)))

export const useLeadingArmy = (sideType: SideType) => useSelector(state => getLeadingArmy(state, sideType))

export const useArmyData = (countryName: CountryName, armyName: ArmyName) =>
  useSelector(state => getArmyData(state, { countryName, armyName }))
