
import * as manager from 'managers/ui'
import { makeActionRemoveFirst, makeContainerReducer, ActionToFunction } from './utils'
import { Modals, ModalType } from 'types'

const actionToFunction: ActionToFunction<Modals> = {}

export const closeModal = makeActionRemoveFirst(manager.closeModal, actionToFunction)
export const openModal: <T extends ModalType>(key: T, object: NonNullable<Modals[T]>) => {} = makeActionRemoveFirst(manager.openModal, actionToFunction)

export const uiReducer = makeContainerReducer({}, actionToFunction)
