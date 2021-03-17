import { countriesIR, culturesIR, inventionsIR, laws, territoriesIR, traditionsArrayIR, traitsIR } from 'data'
import { flatten, sum } from 'lodash'
import {
  ArmyName,
  CountryName,
  dictionaryTacticType,
  dictionaryUnitType,
  GeneralAttribute,
  GovermentType,
  Mode,
  UnitAttribute,
  UnitPreferences,
  UnitPreferenceType
} from 'types'
import { Tech } from 'types/generated'
import { arrayify, excludeMissing, filter, keys, toArr, toObj } from 'utils'
import {
  SaveCharacter,
  Save,
  SaveCountry,
  SaveCountryDeity,
  Territory,
  SavePop,
  TradeGood,
  Character,
  SaveCohort,
  SaveArmy,
  SaveDataUnitName
} from './types'

const getCharacterMartial = (character: SaveCharacter) =>
  character.attributes.martial +
  sum(
    arrayify(character.traits).map(
      (key: string) =>
        traitsIR[key]?.modifiers.find(modifier => modifier.attribute === GeneralAttribute.Martial)?.value ?? 0
    )
  )

const maintenanceToKey = (value: number) => {
  switch (value) {
    case 1:
      return 'high'
    case -1:
      return 'low'
    default:
      return 'default'
  }
}

export const getFirstPlayedCountry = (file: Save) => {
  if (arrayify(file.played_country).length > 0) return arrayify(file.played_country)[0].country
  return null
}

export const loadCountry = (file: Save, id: number) => {
  const deities = file.deity_manager?.deities_database
  const cultures = file.country_culture_manager?.country_culture_database
  const data = file.country?.country_database[id]
  if (!data) return undefined
  if (cultures) {
    const popTypes = toArr(cultures).filter(item => item.country === id && item.pop_type)
    console.log(popTypes)
  }
  const availableLaws = data.laws?.map(value => !!value)
  const country: SaveCountry = {
    armies: data.units,
    culture: data.primary_culture,
    inventions: arrayify(data.active_inventions)
      .map((value, index) => (value ? index : -1))
      .filter(index => index > -1)
      .map(index => inventionsIR[index]),
    heritage: data.heritage ?? '',
    militaryExperience: data.currency_data?.military_experience ?? 0,
    name: (countriesIR[data.country_name?.name.toLowerCase() ?? ''] ?? '') as CountryName,
    civicTech: data.technology?.civic_tech?.level ?? 0,
    martialTech: data.technology?.military_tech?.level ?? 0,
    oratoryTech: data.technology?.oratory_tech?.level ?? 0,
    religiousTech: data.technology?.religious_tech?.level ?? 0,
    armyMaintenance: 'expense_army_' + maintenanceToKey(data.economic_policies[4]),
    navalMaintenance: 'expense_navy_' + maintenanceToKey(data.economic_policies[5]),
    traditions: arrayify(data.military_bonuses)
      .map((value, index) => (value ? index : -1))
      .filter(index => index > -1)
      .map(index => traditionsArrayIR[index]),
    laws: [],
    surplus: [],
    ideas: flatten(arrayify(data.ideas?.idea).map(idea => idea.idea)),
    id,
    deities: deities ? arrayify(data.pantheon).map((deity: SaveCountryDeity) => deities[deity.deity].deity) : [],
    omen: deities && data.omen ? deities[data.omen].key : '',
    religiousUnity: data.religious_unity * 100 ?? 0,
    religion: data.religion ?? '',
    government: '' as GovermentType,
    faction: data.ruler_term?.party ?? '',
    modifiers: arrayify(data.modifier).map(modifier => modifier.modifier),
    isPlayer: !!arrayify(file.played_country).find(player => player.country === Number(id))
  }
  if (file.game_configuration?.difficulty)
    country.modifiers.push(file.game_configuration.difficulty + (country.isPlayer ? '_player' : '_ai'))
  availableLaws &&
    laws
      .filter((_, index) => availableLaws[index])
      .forEach(key => {
        country.laws.push(data[key])
      })
  const government = data.government_key ?? ''
  if (government.endsWith('republic')) country.government = GovermentType.Republic
  else if (government.endsWith('monarchy')) country.government = GovermentType.Monarch
  else country.government = GovermentType.Tribe
  const pops = file.population?.population
  if (data.capital && file.provinces && pops) {
    country.surplus = countSurplus(file, data.capital, pops, country)
  }

  return country
}

export const loadPopsByTerritory = (file: Save, id: number): Territory[] => {
  const pops = file.population?.population
  if (!file.provinces || !pops) return []
  const territories = toArr(file.provinces, (territory, id) => ({ ...territory, id, pop: arrayify(territory.pop) }))
  const ownTerritories = territories
    .filter(territory => territory.controller === id)
    .sort((a, b) => b.pop.length - a.pop.length)
  const territoryPops = ownTerritories.map(territory => ({
    id: territory.id,
    name: territory.province_name.name,
    controller: territory.controller,
    pops: countPops(pops, territory.pop),
    totalPops: territory.pop.length,
    rank: territory.province_rank
  }))
  return territoryPops
}

const countPops = (pops: { [key: number]: SavePop }, ids: number[]) => {
  const counts: { [key: string]: number } = {}
  ids.forEach(ids => {
    const pop = pops[ids]
    const category = `${pop.culture} ${pop.type}`
    counts[category] = (counts[category] ?? 0) + 1
  })
  return counts
}

const countSurplus = (file: Save, capital: number, pops: { [key: number]: SavePop }, country: SaveCountry) => {
  if (!file.provinces) return []
  const province = file.provinces[capital]?.state
  if (province === undefined) return []
  const territories = Object.values(file.provinces).filter(territory => territory.state === province)
  const goods = territories.reduce((prev, territory) => {
    const slaves = territory.pop.filter((id: number) => pops[id].type === 'slaves').length
    const goods = territory.trade_goods
    let baseAmount = 1
    if (territory.province_rank === 'city') baseAmount++
    let slavesForSurplus = 18
    if (territory.province_rank === 'settlement') slavesForSurplus -= 3
    if (territory.buildings[16]) slavesForSurplus -= 5
    if (territory.buildings[17]) slavesForSurplus -= 5
    if (country.laws.includes('formalized_industry_law_tribal')) slavesForSurplus -= 1
    if (country.laws.includes('lex_sempronia_agraria')) slavesForSurplus -= 2
    if (country.laws.includes('republican_land_reform_3')) slavesForSurplus -= 2
    slavesForSurplus = Math.max(1, slavesForSurplus)
    return prev.concat(Array(baseAmount + Math.floor(slaves / slavesForSurplus)).fill(goods))
  }, [] as TradeGood[])
  const counts = toObj(
    goods,
    type => type,
    type => goods.filter(item => item === type).length
  )
  const tradeRoutes = file.trade?.route ?? []
  tradeRoutes.forEach(route => {
    if (route.from_state === province) counts[route.trade_goods]--

    if (route.to_state === province) counts[route.trade_goods] = (counts[route.trade_goods] ?? 0) + 1
  })
  return keys(filter(counts, item => item > 1))
}

const getCharacterName = (character: SaveCharacter) =>
  character.first_name_loc.name + (character.family_name ? ' ' + character.family_name : '')

const loadCharacter = (file: Save, id: number): Character | undefined => {
  const character = file.character?.character_database[id]
  if (!character) return undefined
  return {
    martial: character.attributes.martial,
    traitMartial: getCharacterMartial(character) - character.attributes.martial,
    name: getCharacterName(character),
    traits: character.traits ?? []
  }
}

const loadCohort = (file: Save, id: number): SaveCohort | undefined => {
  const cohort = file.armies?.subunit_database[id]
  if (!cohort) return undefined
  return {
    [UnitAttribute.Experience]: cohort.experience,
    [UnitAttribute.Morale]: cohort.morale,
    [UnitAttribute.Strength]: cohort.strength,
    type: dictionaryUnitType[cohort.type]
  }
}

export const loadArmy = (file: Save, id: number) => {
  const data = file.armies?.units_database[id]
  if (!data) return undefined
  const army: SaveArmy = {
    id,
    name: getArmyName(data.unit_name) as ArmyName,
    cohorts:
      data.cohort ?? data.ship
        ? excludeMissing(arrayify(data.cohort ?? data.ship ?? 0).map(id => loadCohort(file, id)))
        : [],
    flankSize: data.flank_size,
    leader: data.leader ? loadCharacter(file, data.leader) ?? null : null,
    mode: data.is_army === 'yes' ? Mode.Land : Mode.Naval,
    preferences: {
      [UnitPreferenceType.Primary]: dictionaryUnitType[data.primary],
      [UnitPreferenceType.Secondary]: dictionaryUnitType[data.second],
      [UnitPreferenceType.Flank]: dictionaryUnitType[data.flank]
    } as UnitPreferences,
    tactic: dictionaryTacticType[data.tactic],
    ability: data.unit_ability?.which ?? ''
  }
  return army
}

const getArmyName = (army: SaveDataUnitName) => {
  let name = army.name
  if (name.startsWith('RETINUE_ARMY_NAME')) name = 'Retinue'
  else if (name.startsWith('NAVY_NAME')) name = 'Navy'
  else name = 'Army'
  if (army.ordinal) name += ' ' + army.ordinal
  if (army.family) name += ' ' + army.family
  return name
}

export const loadCountryWithArmies = (save: Save, id: number) => {
  const country = id ? loadCountry(save, id) : null
  const armies = country && country.armies ? excludeMissing(country.armies.map(id => loadArmy(save, id))) : []
  return { country, armies }
}

export const countTech = (country: SaveCountry, tech: Tech) =>
  country.inventions.filter(invention => invention.tech === tech).length + ' inventions'

export const getTagName = (tag: string) =>
  countriesIR[tag.toLowerCase()] ? countriesIR[tag.toLowerCase()] + ' (' + tag + ')' : tag

export const getTerritoryName = (name: string) =>
  territoriesIR[name.toLowerCase()] ? territoriesIR[name.toLowerCase()] : name

export const getCategoryName = (name: string) => {
  const split = name.split(' ')
  const rawCulture = split[0].toLowerCase()
  const culture = culturesIR[rawCulture] ?? rawCulture
  if (split.length > 1) return `${culture} ${split[1]}`
  return culture
}

export const loadCountryList = (save: Save) => {
  const data = save.country?.country_database
  if (data) {
    return keys(data).map(key => ({ text: getTagName(data[Number(key)].tag), value: key }))
  }
  return []
}
