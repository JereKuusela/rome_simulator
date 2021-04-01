import {
  TacticType,
  TacticValueType,
  ValuesType,
  Mode,
  TacticData,
  TacticsData,
  Cohorts,
  Tactic,
  TacticCalc
} from 'types'
import { addValuesWithMutate, calculateValue } from 'data_values'
import { getTacticIcon } from 'data'
import { calculateTactic, getTacticMatch } from 'combat'
import { filter } from 'utils'

export const setTacticValue = (tactic: TacticData, key: string, attribute: TacticValueType, value: number) => {
  addValuesWithMutate(tactic, ValuesType.Base, key, [[attribute, value]])
}

export const deleteTactic = (tactics: TacticsData, type: TacticType) => {
  delete tactics[type]
}

export const createTactic = (tactics: TacticsData, type: TacticType, mode: Mode) => {
  tactics[type] = { type, mode, image: getTacticIcon(type) }
}

export const setTacticType = (tactics: TacticsData, oldType: TacticType, type: TacticType) => {
  delete Object.assign(tactics, { [type]: { ...tactics[oldType], type } })[oldType]
}

export const setTacticImage = (tactic: TacticData, image: string) => {
  tactic.image = image
}

export const setTacticMode = (tactic: TacticData, mode: Mode) => {
  tactic.mode = mode
}

export const convertTactic = (tactic: TacticData, cohorts: Cohorts, opposingTactic: TacticData): Tactic => {
  return {
    type: tactic.type,
    effect: calculateTactic(cohorts, tactic),
    damage: calculateTactic(cohorts, tactic, opposingTactic),
    casualties: calculateValue(tactic, TacticCalc.Casualties),
    image: tactic.image,
    match: getTacticMatch(tactic, opposingTactic)
  }
}

const filterTactic = (tactic: TacticData, mode: Mode) => tactic.mode === mode

export const filterTactics = (tactics: TacticsData, mode: Mode) => filter(tactics, tactic => filterTactic(tactic, mode))
