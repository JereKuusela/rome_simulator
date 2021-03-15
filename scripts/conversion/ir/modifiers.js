const DISCIPLINE = 'Discipline'
const OFFENSE = 'Offense'
const DEFENSE = 'Defense'
const ATTRITION = 'Attrition Weight'
const MOD_MAINTENANCE = '_maintenance_cost'
const MAINTENANCE = 'Maintenance'
const MOD_COST = '_cost'
const MANEUVER = 'Maneuver'
const COST = 'Cost'
const EXPERIENCE = 'Experience'
const MOD_MODIFIER = '_modifier'
const MOD_MORALE = '_morale'
const MORALE = 'Morale'
const PARENT = 'Parent'
const GLOBAL = 'Global'
const NAVAL = 'Naval'
const LAND = 'Land'
const TEXT = 'Text'
const COUNTRY = 'Country'
const GENERAL = 'General'

/** @type {Object.<string, string>} */
const localizations = {}

/** @type {Object.<string, number>} */
const scriptValues = {}

const generalStats = [
  'martial',
  'zeal',
  'finesse',
  'charisma',
  'character_loyalty',
  'monthly_character_wealth',
  'health'
]

/** @type {Object.<string, string>} */
const units = {
  archers: 'Archers',
  camels: 'Camel Cavalry',
  chariots: 'Chariots',
  engineer_cohort: 'Engineer',
  horse_archers: 'Horse Archers',
  heavy_infantry: 'Heavy Infantry',
  heavy_cavalry: 'Heavy Cavalry',
  light_cavalry: 'Light Cavalry',
  light_infantry: 'Light Infantry',
  supply_train: 'Supply Train',
  warelephant: 'War Elephants',
  liburnian: 'Liburnian',
  trireme: 'Trireme',
  tetrere: 'Tetrere',
  hexere: 'Hexere',
  octere: 'Octere',
  mega_galley: 'Mega-Polyreme'
}

/** @type {Object.<string, string>} */
const attributes = {
  nation_rank_0: 'Migratory',
  global_monthly_food_modifier: 'National Food',
  create_trade_route_cost_modifier: 'Trade Route Cost',
  attrition_weight: ATTRITION,
  army: 'Mode',
  non_retinue_morale_modifier: MORALE,
  category: PARENT,
  ['build' + MOD_COST]: COST,
  cohort_cost: COST,
  heavy: 'Heavy Ship',
  light: 'Light Ship',
  is_flank: 'Role',
  support: 'Role',
  ['army' + MOD_MAINTENANCE]: MAINTENANCE,
  army_weight_modifier: ATTRITION,
  food_consumption: 'Food Consumption',
  food_storage: 'Food Storage',
  fort_limit: 'Fort limit',
  global_cohort_start_experience: EXPERIENCE,
  global_ship_start_experience: EXPERIENCE,
  global_start_experience: EXPERIENCE,
  ['land' + MOD_MORALE]: MORALE,
  ['land' + MOD_MORALE + MOD_MODIFIER]: MORALE,
  levy_size_multiplier: 'Levy Size Multiplier',
  maintenance_cost: MAINTENANCE,
  maneuver: MANEUVER,
  max_mercenary_stacks: 'Mercenary Limit',
  medium: 'Medium Ship',
  morale: MORALE,
  morale_damage_done: 'Morale Damage Done',
  morale_damage_taken: 'Morale Damage Taken',
  naval_damage_done: 'Damage Done',
  naval_damage_taken: 'Damage Taken',
  ['naval' + MOD_MORALE]: MORALE,
  ['naval' + MOD_MORALE + MOD_MODIFIER]: MORALE,
  ['navy' + MOD_MAINTENANCE]: MAINTENANCE,
  ['ship' + MOD_COST]: COST,
  ship_capture_chance: 'Capture Chance',
  ship_repair_at_sea: 'Ship Repair at Sea',
  strength_damage_done: 'Strength Damage Done',
  strength_damage_taken: 'Strength Damage Taken',
  type: PARENT,
  character_loyalty: 'Loyalty'
}

Object.keys(units).forEach(key => {
  const value = units[key]
  attributes[key] = value
  attributes[key + MOD_MORALE] = MORALE
  attributes[key + MOD_MAINTENANCE] = MAINTENANCE
  attributes[key + '_discipline'] = DISCIPLINE
  attributes[key + '_offensive'] = OFFENSE
  attributes[key + '_defensive'] = DEFENSE
  attributes[key + MOD_COST] = COST
})

/** @type {Object.<string, string>} */
const targets = {
  ['army' + MOD_MAINTENANCE]: LAND,
  army_weight_modifier: LAND,
  non_retinue_morale_modifier: LAND,
  cohort_cost: LAND,
  discipline: GLOBAL,
  global_cohort_start_experience: LAND,
  global_ship_start_experience: NAVAL,
  global_start_experience: GLOBAL,
  ['land' + MOD_MORALE]: LAND,
  ['land' + MOD_MORALE + MOD_MODIFIER]: LAND,
  maintenance_cost: GLOBAL,
  morale: GLOBAL,
  naval_damage_done: NAVAL,
  naval_damage_taken: NAVAL,
  ['naval' + MOD_MORALE]: NAVAL,
  ['naval' + MOD_MORALE + MOD_MODIFIER]: NAVAL,
  ['navy' + MOD_MAINTENANCE]: NAVAL,
  ['ship' + MOD_COST]: NAVAL,
  ship_capture_chance: NAVAL,
  martial: GENERAL,
  omen_power: COUNTRY
}

Object.keys(units).forEach(key => {
  const value = units[key]
  targets[key + MOD_MORALE] = value
  targets[key + MOD_MAINTENANCE] = value
  targets[key + '_discipline'] = value
  targets[key + '_offensive'] = value
  targets[key + '_defensive'] = value
  targets[key + MOD_COST] = value
})

const noPercents = new Set([
  'land' + MOD_MORALE,
  'morale',
  'naval' + MOD_MORALE,
  'general_loyalty',
  'admiral_loyalty',
  'hostile_attrition',
  'siege_engineers',
  'fort_limit',
  'max_mercenary_stacks',
  'retreat_delay',
  'war_exhaustion',
  'global_building_slot',
  'subject_loyalty',
  'diplomatic_reputation',
  'diplomatic_relations',
  'subject_opinions',
  'country_civilization_value',
  'ruler_popularity_gain',
  'governor_loyalty',
  'global_capital_trade_routes',
  'omen_power',
  'loyalty_to_overlord'
])

generalStats.forEach(key => {
  noPercents.add(key)
})

const negatives = new Set([
  'army' + MOD_MAINTENANCE,
  'army_weight_modifier',
  'experience_decay',
  'cohort_cost',
  'fort' + MOD_MAINTENANCE,
  'land_unit_attrition',
  'maintenance_cost',
  'naval_damage_taken',
  'navy' + MOD_MAINTENANCE,
  'naval_unit_attrition',
  'price_state_investment_military_cost_modifier',
  'price_state_investment_oratory_cost_modifier',
  'price_state_investment_civic_cost_modifier',
  'retreat_delay',
  'ship' + MOD_COST,
  'loyalty_gain_chance',
  'hold_triumph_cost_modifier',
  'war_exhaustion',
  'mercenary_land_maintenance_cost',
  'mercenary_naval_maintenance_cost',
  'recruit_mercenary_cost_modifier',
  'loyalty_gain_chance_modifier',
  'price_found_city_cost_modifier',
  'agressive_expansion_impact',
  'build_cost',
  'war_score_cost',
  'monthly_tyranny',
  'enact_law_cost_modifier',
  'stability_cost_modifier',
  'increase_legitimacy_cost_modifier',
  'loyalty_to_overlord',
  'fortress_building_cost'
])

Object.keys(units).forEach(key => {
  negatives.add(key + MOD_COST)
  negatives.add(key + MOD_MAINTENANCE)
})

const BASE = 'Base'
const MODIFIER = 'Modifier'

const types = new Set([
  'army' + MOD_MAINTENANCE,
  'army_weight_modifier',
  'land' + MOD_MORALE + MOD_MODIFIER,
  'maintenance_cost',
  'maneuver_value',
  'navy' + MOD_MAINTENANCE,
  'naval' + MOD_MORALE + MOD_MODIFIER,
  'ship' + MOD_COST,
  'non_retinue_morale_modifier'
])

Object.keys(units).forEach(key => {
  types.add(key + MOD_MORALE)
  types.add(key + MOD_COST)
  types.add(key + MOD_MAINTENANCE)
})

/**
 *
 * @param {string} value
 */
exports.format = value => {
  let split = value.split('_')
  split = split.map(part => part[0].toUpperCase() + part.substring(1))
  return split.join(' ')
}

/**
 * @param {string} key
 * @param {string} value
 */
exports.getAttribute = (key, value) => {
  if (key === 'mercenary_land_maintenance_cost') key = 'modifier_land_mercenary_maintenance_cost'
  if (key === 'mercenary_naval_maintenance_cost') key = 'modifier_naval_mercenary_maintenance_cost'
  let attribute = attributes[key] || localizations['modifier_' + key] || localizations[key]
  if (attribute && attribute.startsWith('$')) {
    key = attribute.substr(1, attribute.length - 2)
    attribute = attributes[key] || localizations['modifier_' + key] || localizations[key]
  }
  switch (key) {
    case 'movement_speed':
    case 'build_time':
    case 'legions':
    case 'outside_of_naval_range_attrition':
      return undefined
    case 'allow_unit_type':
    case 'enable_ability':
    case 'enable_tactic':
      return attribute.replace('$WHICH|Y$', attributes[value] || localizations[value])
    // Units have different name for build cost.
    case 'build' + MOD_COST:
      return value && value.gold ? attributes[key] : localizations['modifier_' + key] || localizations[key]
    default:
      return attribute
  }
}
/**
 * @param {string} key
 */
exports.getTarget = key => targets[key] || TEXT
/**
 * @param {string} key
 */
exports.getNoPercent = key => (noPercents.has(key) ? true : undefined)
/**
 * @param {string} key
 * @param {string} value
 */
exports.getNegative = (key, value) =>
  typeof value === 'number' && negatives.has(key) === value >= 0 ? true : undefined
/**
 * @param {string} key
 */
exports.getType = key => (types.has(key) ? MODIFIER : BASE)
/**
 * @param {string} key
 * @param {string} value
 */
exports.getValue = (key, value) => {
  if (Array.isArray(value)) value = value[0]
  if (typeof value === 'string' && scriptValues[value]) value = scriptValues[value]
  switch (key) {
    case 'allow_unit_type':
    case 'enable_ability':
    case 'enable_tactic':
      return 0
    case 'omen_power':
      return 100 * value
    case 'global_start_experience':
    case 'global_cohort_start_experience':
    case 'global_ship_start_experience':
      return value * 0.01
    case 'army':
      return value === 'yes' ? 'Land' : 'Naval'
    case 'build_cost':
      return value.gold || value
    case 'light_infantry':
    case 'heavy_infantry':
    case 'heavy_cavalry':
    case 'warelephant':
    case 'horse_archers':
    case 'archers':
    case 'camels':
    case 'chariots':
    case 'light_cavalry':
    case 'supply_train':
    case 'liburnian':
    case 'trireme':
    case 'tetrere':
    case 'hexere':
    case 'octere':
    case 'mega_galley':
    case 'morale_damage_taken':
    case 'morale_damage_done':
    case 'strength_damage_taken':
    case 'strength_damage_done':
    case 'attrition_weight':
      return Math.round(100 * (Number(value) - 1)) / 100
    case 'category':
    case 'type':
      return exports.getAttribute(value)
    case 'is_flank':
      return value === 'yes' ? 'Flank' : ''
    case 'support':
      return value === 'yes' ? 'Support' : ''
    default:
      return value === 'yes' ? 0 : value
  }
}

/** @type {Object<string, string>} */
let cultures = {}

exports.getCultures = () => cultures

/** @type {Object<string, string>} */
let countries = {}

exports.getCountries = () => countries

/** @type {Object<string, string>} */

let territories = {}

exports.getTerritories = () => territories

/**
 * @param {Object<string, string>} localization
 * @param {string} file
 */
exports.loadLocalization = (localization, file) => {
  if (file === 'countries_l_english.yml') {
    Object.keys(localization).forEach(key => {
      if (key.length > 3) delete localization[key]
    })
    Object.keys(localization)
      .sort((a, b) => localization[a].localeCompare(localization[b]))
      .forEach(key => (countries[key] = localization[key]))
    return
  }
  if (file === 'cultures_l_english.yml') {
    Object.keys(localization).forEach(key => {
      if (localization[key].length === 0 || key.endsWith('name')) delete localization[key]
    })
    Object.keys(localization)
      .sort((a, b) => localization[a].localeCompare(localization[b]))
      .forEach(key => (cultures[key] = localization[key]))
    return
  }
  if (file === 'provincenames_l_english.yml') {
    Object.keys(localization).forEach(key => {
      if (localization[key].length === 0) delete localization[key]
      else if (localization[key].startsWith('$'))
        localization[key] = localization[localization[key].substr(1, localization[key].length - 2).toLowerCase()]
    })
    Object.keys(localization)
      .sort((a, b) => localization[a].localeCompare(localization[b]))
      .forEach(key => (territories[key] = localization[key]))
    return
  }
  Object.assign(localizations, localization)
  if (file === 'terrains_l_english.yml') {
    Object.keys(localization)
      .filter(terrain => !terrain.endsWith('_desc'))
      .forEach(terrain => {
        const key = `${terrain}_combat_bonus`
        attributes[key] = `${localization[terrain]} Damage`
        targets[key] = GLOBAL
        types.add(key)
        Object.keys(units).forEach(unit => {
          const key = `${unit}_${terrain}_combat_bonus`
          attributes[key] = `${localization[terrain]} Damage`
          targets[key] = units[unit]
          types.add(key)
        })
      })
  }
}

/**
 * @param {{}} scriptValue
 * @param {string} file
 */
exports.loadScriptValue = scriptValue => {
  Object.assign(scriptValues, scriptValue)
}
