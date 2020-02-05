import { Country, GovermentType, ReligionType, CultureType } from "types"

export const selectGovernment = (country: Country, government: GovermentType) => {
  country.government = government
}

export const selectReligion = (country: Country, religion: ReligionType) => {
  country.religion = religion
}

export const selectCulture = (country: Country, culture: CultureType) => {
  country.culture = culture
}

export const setOmenPower = (country: Country, omen_power: number) => {
  country.omen_power = omen_power
}

export const setMilitaryPower = (country: Country, military_power: number) => {
  country.military_power = military_power
}

export const setOfficeDiscipline = (country: Country, office_discipline: number) => {
  country.office_discipline = office_discipline
}

export const setOfficeMorale = (country: Country, office_morale: number) => {
  country.office_morale = office_morale
}

export const enableSelection = (country: Country, key: string) => {
  country.selections[key] = true
}

export const clearSelection = (country: Country, key: string) => {
  delete country.selections[key]
}