import { Modals, ModalType } from 'types'

export const closeModal = (modals: Modals) => {
  for (let key in modals)
    (modals as any)[key] = undefined
}

export const openModal = <T extends ModalType>(modals: Modals, key: T, object: NonNullable<Modals[T]>) => {
  modals[key] = object
}
