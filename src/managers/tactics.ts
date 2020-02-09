import { TacticType, TacticValueType, ValuesType, DefinitionType, Tactic, Tactics } from "types"
import { addValuesWithMutate } from "definition_values"
import { getTacticIcon } from "data"

export const setTacticBaseValue = (tactic: Tactic, key: string, attribute: TacticValueType, value: number) => {
  addValuesWithMutate(tactic, ValuesType.Base, key, [[attribute, value]])
}

export const deleteTactic = (tactics: Tactics, type: TacticType) => {
  delete tactics[type]
}

export const createTactic = (tactics: Tactics, type: TacticType, mode: DefinitionType) => {
  tactics[type] = { type, mode, image: getTacticIcon(type) }
}

export const setTacticType = (tactics: Tactics, old_type: TacticType, type: TacticType) => {
  delete Object.assign(tactics, { [type]: tactics[old_type] })[old_type]
}

export const setTacticImage = (tactic: Tactic, image: string) => {
  tactic.image = image
}

export const setTacticMode = (tactic: Tactic, mode: DefinitionType) => {
  tactic.mode = mode
}
