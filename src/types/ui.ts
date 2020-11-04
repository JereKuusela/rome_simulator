import { SideType } from './battle'
import { ArmyName } from './armies'
import { CountryName } from './countries'
import { UnitType } from './units'
import { TerrainType } from './terrains'
import { TacticType } from './tactics'
import { ObjSet } from 'utils'

export enum ModalType {
  DiceRolls = 'DiceRolls',
  CohortDetail = 'CohortDetail',
  UnitDetail = 'UnitDetail',
  TerrainDetail = 'TerrainDetail',
  TacticDetail = 'TacticDetail',
  Value = 'Value'
}

export type UI = {
  accordions: ObjSet
  modals: Modals
  selectedParticipantIndex: { [key in SideType]: number }
}

export type Modals = {
  [ModalType.DiceRolls]?: {
    side: SideType
  }
  [ModalType.CohortDetail]?: {
    side: SideType
    participantIndex: number
    index: number
    country: CountryName
    army: ArmyName
  }
  [ModalType.UnitDetail]?: {
    country: CountryName
    army: ArmyName
    type: UnitType
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
    buttonMessage: string
    initial: string
  }
}
