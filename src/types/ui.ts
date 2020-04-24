import { Side } from "./battle"
import { ArmyType, ArmyName } from "./armies"
import { CountryName } from "./countries"
import { UnitType } from "./units"
import { TerrainType } from "./terrains"
import { TacticType } from "./tactics"
import { ObjSet } from "utils"

export enum ModalType {
  DiceRolls = 'DiceRolls',
  CohortSelector = 'CohortSelector',
  CohortDetail = 'CohortDetail',
  UnitDetail = 'UnitDetail',
  TerrainDetail = 'TerrainDetail',
  TacticDetail = 'TacticDetail',
  Value = 'Value',
  ImportCountry = 'ImportCountry'
}

export type UI = {
  accordions: ObjSet
  modals: Modals
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
    army: ArmyName,
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
  [ModalType.ImportCountry]?: {}
}
