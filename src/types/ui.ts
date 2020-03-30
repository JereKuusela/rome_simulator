import { Side } from "./battle"
import { ArmyType } from "./armies"
import { CountryName } from "./countries"
import { UnitType } from "./units"

export enum ModalType {
  DiceRolls = 'DiceRolls',
  CohortSelector = 'CohortSelector',
  CohortDetail = 'CohortDetail',
  UnitDetail = 'UnitDetail'
}

export type Modals = {
  [ModalType.DiceRolls]?: {
    side: Side
  }
  [ModalType.CohortSelector]?: {
    side: Side,
    type: ArmyType,
    row: number,
    column: number
  }
  [ModalType.CohortDetail]?: {
    side: Side,
    id: number
  }
  [ModalType.UnitDetail]?: {
    country: CountryName,
    type: UnitType,
    remove?: boolean
  }
}
