
import * as manager from 'managers/ui'
import { makeActionRemoveFirst, makeContainerReducer, ActionToFunction } from './utils'
import { Modals, ModalType, UI, SideType } from 'types'

const mapping: ActionToFunction<UI> = {}

export const closeModal = makeActionRemoveFirst(manager.closeModal, mapping)
export const toggleAccordion = makeActionRemoveFirst(manager.toggleAccordion, mapping)
export const selectParticipant = makeActionRemoveFirst(manager.selectParticipant, mapping)
export const openModal: <T extends ModalType>(key: T, object: NonNullable<Modals[T]>) => {} = makeActionRemoveFirst(manager.openModal, mapping)

export const uiReducer = makeContainerReducer({ modals: {}, accordions: {}, selectedParticipantIndex: { [SideType.A]: 0, [SideType.B]: 0 } }, mapping)
