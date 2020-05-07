
import * as manager from 'managers/ui'
import { makeActionRemoveFirst, makeContainerReducer, ActionToFunction } from './utils'
import { Modals, ModalType, UI } from 'types'

const mapping: ActionToFunction<UI> = {}

export const closeModal = makeActionRemoveFirst(manager.closeModal, mapping)
export const toggleAccordion = makeActionRemoveFirst(manager.toggleAccordion, mapping)
export const openModal: <T extends ModalType>(key: T, object: NonNullable<Modals[T]>) => {} = makeActionRemoveFirst(manager.openModal, mapping)

export const uiReducer = makeContainerReducer({ modals: {}, accordions: {}}, mapping)
