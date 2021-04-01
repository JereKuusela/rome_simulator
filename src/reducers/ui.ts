import * as manager from 'managers/ui'
import { makeActionRemoveFirst, makeContainerReducer, ActionToFunction } from './utils'
import { Modals, ModalType, UI, SideType, Mode } from 'types'

const mapping: ActionToFunction<UI> = {}

const initialState: UI = {
  modals: {},
  accordions: {},
  selectedParticipantIndex: { [SideType.A]: 0, [SideType.B]: 0 },
  mode: Mode.Land,
  selectedArmyIndex: 0,
  selectedCountryIndex: 0,
  filterNonCombat: true
}

export const closeModal = makeActionRemoveFirst(manager.closeModal, mapping)
export const toggleAccordion = makeActionRemoveFirst(manager.toggleAccordion, mapping)
export const selectParticipant = makeActionRemoveFirst(manager.selectParticipant, mapping)
export const openModal: <T extends ModalType>(
  key: T,
  object: NonNullable<Modals[T]>
) => unknown = makeActionRemoveFirst(manager.openModal, mapping)
export const selectCountry = makeActionRemoveFirst(manager.selectCountry, mapping)
export const selectArmy = makeActionRemoveFirst(manager.selectArmy, mapping)
export const setMode = makeActionRemoveFirst(manager.setMode, mapping)
export const toggleFilterNonCombat = makeActionRemoveFirst(manager.toggleFilterNonCombat, mapping)

export const uiReducer = makeContainerReducer(initialState, mapping)
