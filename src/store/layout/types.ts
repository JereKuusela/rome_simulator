import { UnitDefinition } from '../units'

export enum LayoutActionTypes {
  SET_UNIT_MODAL = '@@layout/SET_UNIT_MODAL'
}

export interface LayoutState {
  readonly unit_modal: UnitDefinition | null
}
