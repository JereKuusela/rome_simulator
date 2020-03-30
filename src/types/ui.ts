import { Side } from "./battle"

export enum ModalType {
  DiceRolls = 'DiceRolls'
}

export type Modals = {
  [ModalType.DiceRolls]?: {
    side: Side
  }
}
