import { TacticType, TacticValueType, ValuesType, Mode, TacticDefinition, TacticDefinitions, Cohorts, Tactic, TacticCalc } from "types"
import { addValuesWithMutate, calculateValue } from "definition_values"
import { getTacticIcon } from "data"
import { calculateTactic, getTacticMatch } from "combat"

export const setTacticValue = (tactic: TacticDefinition, key: string, attribute: TacticValueType, value: number) => {
  addValuesWithMutate(tactic, ValuesType.Base, key, [[attribute, value]])
}

export const deleteTactic = (tactics: TacticDefinitions, type: TacticType) => {
  delete tactics[type]
}

export const createTactic = (tactics: TacticDefinitions, type: TacticType, mode: Mode) => {
  tactics[type] = { type, mode, image: getTacticIcon(type) }
}

export const setTacticType = (tactics: TacticDefinitions, oldType: TacticType, type: TacticType) => {
  delete Object.assign(tactics, { [type]: { ...tactics[oldType], type } })[oldType]
}

export const setTacticImage = (tactic: TacticDefinition, image: string) => {
  tactic.image = image
}

export const setTacticMode = (tactic: TacticDefinition, mode: Mode) => {
  tactic.mode = mode
}


export const convertTactic = (tactic: TacticDefinition, cohorts: Cohorts, opposingTactic: TacticDefinition): Tactic => {
  return {
    type: tactic.type,
    effect: calculateTactic(cohorts, tactic),
    damage: calculateTactic(cohorts, tactic, opposingTactic),
    casualties: calculateValue(tactic, TacticCalc.Casualties),
    image: tactic.image,
    match: getTacticMatch(tactic, opposingTactic)
  }
}
