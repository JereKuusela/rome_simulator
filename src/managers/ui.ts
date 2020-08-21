import { UI, ModalType, Modals, SideType } from 'types'
import { has } from 'lodash'

export const closeModal = (ui: UI) => {
  for (let key in ui.modals)
    (ui.modals as any)[key] = undefined
}

export const openModal = <T extends ModalType>(ui: UI, key: T, object: NonNullable<Modals[T]>) => {
  ui.modals[key] = object
}

export const selectParticipant = (ui: UI, side: SideType, index: number) => {
  ui.selectedParticipantIndex[side] = index
}

export const toggleAccordion = (ui: UI, key: string) => {
  if (has(ui.accordions, key))
    delete ui.accordions[key]
  else
    ui.accordions[key] = true
}
