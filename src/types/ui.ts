import { Side } from "./battle"
import { ArmyType } from "./armies"
import { CountryName } from "./countries"
import { UnitType } from "./units"
import { TerrainType } from "./terrains"
import { TacticType } from "./tactics"

export enum ModalType {
  DiceRolls = 'DiceRolls',
  CohortSelector = 'CohortSelector',
  CohortDetail = 'CohortDetail',
  UnitDetail = 'UnitDetail',
  TerrainDetail = 'TerrainDetail',
  TacticDetail = 'TacticDetail',
  Value = 'Value'
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
  [ModalType.TerrainDetail]?: {
    type: TerrainType
  }
  [ModalType.TacticDetail]?: {
    type: TacticType
  }
  [ModalType.Value]?: {
    onSuccess: (value: string) => void
    message: string
    button_message: string
    initial: string
  }
}
