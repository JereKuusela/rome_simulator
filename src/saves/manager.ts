import { countriesIR, culturesIR, inventionsIR, laws, regionsIR, territoriesIR, traditionsIR, traitsIR } from 'data'
import { getConfig } from 'data/config'
import { countBy, flatten, groupBy, range, sum, sumBy, upperFirst } from 'lodash'
import {
  ArmyName,
  Country,
  CountryAttribute,
  CountryName,
  dictionaryTacticType,
  dictionaryUnitType,
  GeneralAttribute,
  GovermentType,
  Mode,
  TacticType,
  UnitAttribute,
  UnitPreferences,
  UnitPreferenceType
} from 'types'
import { Tech } from 'types/generated'
import { arrayify, excludeMissing, filter, forEach, keys, map, toArr, toObj, values } from 'utils'
import {
  SaveDataCharacter,
  Save,
  SaveCountry,
  SaveCountryDeity,
  Territory,
  SavePop,
  TradeGood,
  SaveCharacter,
  SaveCohort,
  SaveArmy,
  SaveDataUnitName,
  SaveDataCountry
} from './types'

const getCharacterBaseAttribute = (character: SaveDataCharacter, attribute: GeneralAttribute) => {
  if (attribute === GeneralAttribute.Martial) return character.attributes.martial
  if (attribute === GeneralAttribute.Finesse) return character.attributes.finesse
  if (attribute === GeneralAttribute.Charisma) return character.attributes.charisma
  if (attribute === GeneralAttribute.Zeal) return character.attributes.zeal
  return 0
}

const getCharacterAttribute = (character: SaveDataCharacter, attribute: GeneralAttribute) =>
  getCharacterBaseAttribute(character, attribute) +
  sum(
    arrayify(character.traits).map(
      (key: string) => traitsIR.get(key)?.modifiers.find(modifier => modifier.attribute === attribute)?.value ?? 0
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

const getCountryName = (country: SaveDataCountry) => (countriesIR[country.tag.toLowerCase()] ?? '') as CountryName

export const loadCountry = (file: Save, id: number) => {
  const deities = file.deity_manager?.deities_database
  const data = file.country?.country_database[id]
  if (!data) return undefined
  const availableLaws = data.laws?.map(value => !!value)
  const country: SaveCountry = {
    armies: data.units,
    culture: data.primary_culture,
    inventions: arrayify(data.active_inventions)
      .map((value, index) => (value ? index : -1))
      .filter(index => index > -1)
      .map(index => inventionsIR.get(index)),
    heritage: data.heritage ?? '',
    militaryExperience: data.currency_data?.military_experience ?? 0,
    name: getCountryName(data),
    civicTech: data.technology?.civic_tech?.level ?? 0,
    martialTech: data.technology?.military_tech?.level ?? 0,
    oratoryTech: data.technology?.oratory_tech?.level ?? 0,
    religiousTech: data.technology?.religious_tech?.level ?? 0,
    armyMaintenance: 'expense_army_' + maintenanceToKey(data.economic_policies[4]),
    navalMaintenance: 'expense_navy_' + maintenanceToKey(data.economic_policies[5]),
    traditions: arrayify(data.military_bonuses)
      .map((value, index) => (value ? index : -1))
      .filter(index => index > -1)
      .map(index => traditionsIR.get(index)),
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
    id: Number(territory.id),
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

const getGovernor = (save: Save, countryId: number, region: string) => {
  const jobs = save.jobs?.province_job
  const country = save.country?.country_database?.[countryId]
  if (!jobs || !country) return -1
  const job = jobs.find(item => item.governorship === region && item.who === countryId)
  if (job) return job.character
  return country.ruler_term?.character ?? -1
}

const getIntegratedCultures = (file: Save, id: number) => {
  const cultures = file.country_culture_manager?.country_culture_database
  if (!cultures) return []

  return toArr(cultures)
    .filter(item => item.country === id && item.integration_status === 'integrated')
    .map(item => item.culture)
}

const sumObjects = <T extends string>(objects: Record<T, number>[]) => {
  const total = {} as Record<T, number>
  objects.forEach(object => {
    forEach(object, (value, key) => {
      if (!total[key]) total[key] = 0
      total[key] += value
    })
  })
  return total
}

const getLevyablePOps = (file: Save, id: number) => {
  const territories = file.provinces
  const population = file.population?.population
  if (!territories || !population) return
  const integratedCultures = getIntegratedCultures(file, id)
  const regions = filter(regionsIR, regionTerritories =>
    regionTerritories.some(index => territories[index].owner === id)
  )
  const popsPerTerritory = map(regions, (regionTerritories, region) => {
    let governor = -1
    const pops = regionTerritories
      .filter(index => territories[index].owner === id)
      .map(index => {
        const territory = territories[index]
        if (governor === -1) governor = getGovernor(file, id, region)
        const pops = arrayify(territory.pop)
        const levyablePops = pops
          .map(index => population[index])
          .filter(item => item.type !== 'slaves' && integratedCultures.includes(item.culture))
        return countBy(levyablePops, item => item.culture)
      })
    return { pops, governor }
  })
  const popsPerRegion = map(popsPerTerritory, item => {
    const pops = sumObjects(item.pops)
    return { ...item, pops }
  })
  return popsPerRegion
}

const getCulture = (save: Save, id: number) => {
  const country = save.country?.country_database[id]
  return culturesIR[country?.primary_culture ?? '']
}

const getUnitPreferences = (save: Save, id: number) => {
  const culture = getCulture(save, id)
  if (culture) {
    return {
      [UnitPreferenceType.Primary]: dictionaryUnitType[culture.primary],
      [UnitPreferenceType.Secondary]: dictionaryUnitType[culture.secondary],
      [UnitPreferenceType.Flank]: dictionaryUnitType[culture.flank]
    } as UnitPreferences
  }
  return {
    [UnitPreferenceType.Primary]: null,
    [UnitPreferenceType.Secondary]: null,
    [UnitPreferenceType.Flank]: null
  } as UnitPreferences
}

const cleanName = (name: string) => name.split('_').map(upperFirst).join(' ')

const getLevyName = (region: string) => ('Levy ' + cleanName(region.substring(0, region.length - 7))) as ArmyName

export const getLevies = (save: Save, id: number, levyMultiplier: number) => {
  const regions = getLevyablePOps(save, id)
  if (!regions) return
  const levies = map(regions, region => {
    const levies = toArr(region.pops, (amount, culture) => {
      const template = culturesIR[culture].template
      const cohorts = toArr(
        map(template, item => levyMultiplier * item * amount),
        (value, key) => ({ key, value })
      )
      return cohorts
    })
    const grouped = groupBy(levies.flat(), item => item.key)
    const rawUnits = map(grouped, item => sumBy(item, item => item.value))
    let remaining = Math.max(getConfig().LevyMinimumSize, Math.floor(levyMultiplier * sum(values(region.pops))))
    const units = map(rawUnits, item => {
      const amount = Math.min(remaining, Math.ceil(item))
      remaining -= amount
      return amount
    })
    const defaultTemplate = culturesIR['default'].template
    forEach(defaultTemplate, (item, type) => {
      const amount = Math.min(remaining, Math.ceil(remaining * item))
      remaining -= amount
      if (!units[type]) units[type] = 0
      units[type] += amount
    })
    units['supply_train'] = Math.floor(sum(values(units)) / getConfig().LevySupportLimit)
    return { units, leader: region.governor }
  })
  const preferences = getUnitPreferences(save, id)
  let counter = -1
  const armies: SaveArmy[] = toArr(levies, (army, region) => ({
    id: counter--,
    name: getLevyName(region),
    cohorts: toArr(army.units, (amount, type) =>
      range(amount).map(() => ({
        type: dictionaryUnitType[type],
        [UnitAttribute.Experience]: undefined,
        [UnitAttribute.Strength]: undefined,
        [UnitAttribute.Morale]: undefined
      }))
    ).flat(),
    mode: Mode.Land,
    tactic: TacticType.ShockAction,
    preferences,
    flankSize: 5,
    leader: loadCharacter(save, army.leader),
    ability: ''
  }))
  return armies
}

const getCharacterName = (character: SaveDataCharacter) =>
  character.first_name_loc.name + (character.family_name ? ' ' + character.family_name : '')

const loadCharacter = (save: Save, id: number | undefined): SaveCharacter | undefined => {
  const countries = save.country?.country_database
  const character = save.character?.character_database[id ?? -1]
  if (!character || !countries) return undefined
  return {
    id: id ?? -1,
    attributes: toObj(
      values(GeneralAttribute),
      attribute => attribute,
      attribute => getCharacterAttribute(character, attribute)
    ),
    baseAttributes: toObj(
      values(GeneralAttribute),
      attribute => attribute,
      attribute => getCharacterBaseAttribute(character, attribute)
    ),
    name: getCharacterName(character),
    traits: character.traits ?? [],
    countryName: getCountryName(countries[character.country]),
    country: character.country,
    age: character.age
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
    leader: loadCharacter(file, data.leader),
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

const armySorter = (a: SaveArmy, b: SaveArmy) => {
  const mode = a.mode.localeCompare(b.mode)
  if (mode) return mode
  const units = b.cohorts.length - a.cohorts.length
  if (units) return units
  return a.name.localeCompare(b.name)
}

export const loadArmies = (save: Save, saveCountry: SaveCountry, country: Country) => {
  const armies = saveCountry.armies ? excludeMissing(saveCountry.armies.map(id => loadArmy(save, id))) : []
  const levies =
    getLevies(save, saveCountry.id, Math.min(getConfig().LevyMaxMultiplier, country[CountryAttribute.LevySize])) ?? []
  return [...armies, ...levies].sort(armySorter)
}

export const countTech = (country: SaveCountry, tech: Tech) =>
  country.inventions.filter(invention => invention.parent === tech).length + ' inventions'

export const getTagName = (tag: string) =>
  countriesIR[tag.toLowerCase()] ? countriesIR[tag.toLowerCase()] + ' (' + tag + ')' : tag

export const getTerritoryName = (name: string) =>
  territoriesIR[name.toLowerCase()] ? territoriesIR[name.toLowerCase()] : name

export const getCategoryName = (name: string) => {
  const split = name.split(' ')
  const rawCulture = split[0].toLowerCase()
  const culture = culturesIR[rawCulture]?.name ?? rawCulture
  if (split.length > 1) return `${culture} ${split[1]}`
  return culture
}

export const loadCountryList = (save: Save | undefined) => {
  const data = save?.country?.country_database
  if (data) {
    return keys(data).map(key => ({ text: getTagName(data[Number(key)].tag), value: key }))
  }
  return []
}

export const loadCharacters = (save: Save | undefined) => {
  if (save)
    return toArr(save.character?.character_database ?? {}, (_, id) => loadCharacter(save, Number(id))).filter(
      item => item
    ) as SaveCharacter[]
  return []
}
