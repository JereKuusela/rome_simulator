import { TacticType, TacticValueType, ValuesType, Mode, TacticDefinition, Tactics } from "types"
import { addValuesWithMutate } from "definition_values"
import { getTacticIcon } from "data"

export const setTacticBaseValue = (tactic: TacticDefinition, key: string, attribute: TacticValueType, value: number) => {
  addValuesWithMutate(tactic, ValuesType.Base, key, [[attribute, value]])
}

export const deleteTactic = (tactics: Tactics, type: TacticType) => {
  delete tactics[type]
}

export const createTactic = (tactics: Tactics, type: TacticType, mode: Mode) => {
  tactics[type] = { type, mode, image: getTacticIcon(type) }
}

export const setTacticType = (tactics: Tactics, old_type: TacticType, type: TacticType) => {
  delete Object.assign(tactics, { [type]: { ...tactics[old_type], type } })[old_type]
}

export const setTacticImage = (tactic: TacticDefinition, image: string) => {
  tactic.image = image
}

export const setTacticMode = (tactic: TacticDefinition, mode: Mode) => {
  tactic.mode = mode
}
