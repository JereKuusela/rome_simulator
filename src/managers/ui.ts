import { Modals, ModalType } from 'types'

export const closeModal = (modals: Modals, key: ModalType) => {
  modals[key] = undefined
}

export const openModal = <T extends ModalType>(modals: Modals, key: T, object: NonNullable<Modals[T]>) => {
  modals[key] = object
}
