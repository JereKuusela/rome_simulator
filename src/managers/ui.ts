import { UI, ModalType, Modals, SideType, Mode } from 'types'
import { has } from 'lodash'

export const closeModal = (ui: UI) => {
  for (const key in ui.modals) (ui.modals as Record<string, undefined>)[key] = undefined
}

export const openModal = <T extends ModalType>(ui: UI, key: T, object: NonNullable<Modals[T]>) => {
  ui.modals[key] = object
}

export const selectParticipant = (ui: UI, side: SideType, index: number) => {
  ui.selectedParticipantIndex[side] = index
}

export const toggleAccordion = (ui: UI, key: string) => {
  if (has(ui.accordions, key)) delete ui.accordions[key]
  else ui.accordions[key] = true
}

export const toggleFilterNonCombat = (ui: UI) => {
  ui.filterNonCombat = !ui.filterNonCombat
}

export const setMode = (ui: UI, mode: Mode) => {
  ui.mode = mode
  ui.selectedCountryIndex = 0
  ui.selectedParticipantIndex = {
    [SideType.A]: 0,
    [SideType.B]: 0
  }
  ui.selectedArmyIndex = 0
}

export const selectCountry = (ui: UI, countryIndex: number) => {
  ui.selectedCountryIndex = countryIndex
  ui.selectedArmyIndex = 0
}

export const selectArmy = (ui: UI, armyIndex: number) => {
  ui.selectedArmyIndex = armyIndex
}
