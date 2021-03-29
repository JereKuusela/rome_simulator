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
  create_trade_route_cost_modifier: 'Trade Route Cost',
  attrition_weight: ATTRITION,
  army: 'Mode',
  non_retinue_morale_modifier: MORALE,
  category: PARENT,
  congenital: 'Congenital',
  ['build' + MOD_COST]: COST,
  cohort_cost: COST,
  heavy: 'Heavy Ship',
  light: 'Light Ship',
  is_flank: 'Role',
  support: 'Role',
  ['army' + MOD_MAINTENANCE]: MAINTENANCE,
  army_weight_modifier: ATTRITION,
  control_range_modifier: 'Control Range Modifier',
  food_consumption: 'Food Consumption',
  food_storage: 'Food Storage',
  fort_limit: 'Fort limit',
  global_cohort_start_experience: EXPERIENCE,
  global_ship_start_experience: EXPERIENCE,
  global_start_experience: EXPERIENCE,
  great_work_total_workrate_character_modifier: 'Great Work Workrate',
  great_work_fixed_prestige_character_modifier: 'Great Work Fixed Prestige',
  ['land' + MOD_MORALE]: MORALE,
  ['land' + MOD_MORALE + MOD_MODIFIER]: MORALE,
  levy_size_multiplier: 'Levy Size',
  maintenance_cost: MAINTENANCE,
  maneuver: MANEUVER,
  max_mercenary_stacks: 'Maximum Mercenary Armies',
  max_research_efficiency: 'Maximum Research Efficiency',
  medium: 'Medium Ship',
  morale: MORALE,
  morale_damage_done: 'Morale Damage Done',
  morale_damage_taken: 'Morale Damage Taken',
  naval_damage_done: 'Damage Done',
  naval_damage_taken: 'Damage Taken',
  personality: 'Personality',
  ['naval' + MOD_MORALE]: MORALE,
  ['naval' + MOD_MORALE + MOD_MODIFIER]: MORALE,
  ['navy' + MOD_MAINTENANCE]: MAINTENANCE,
  ['ship' + MOD_COST]: COST,
  ship_capture_chance: 'Capture Chance',
  ship_repair_at_sea: 'Ship Repair at Sea',
  strength_damage_done: 'Strength Damage Done',
  strength_damage_taken: 'Strength Damage Taken',
  stability_cost_modifier: 'Divine Sacrifice Cost',
  type: PARENT,
  character_loyalty: 'Loyalty',
  watercrossing_negation: 'Crossing Support'
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
  levy_size_multiplier: COUNTRY,
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
  'agressive_expansion_monthly_change',
  'land' + MOD_MORALE,
  'morale',
  'naval' + MOD_MORALE,
  'general_loyalty',
  'admiral_loyalty',
  'current_corruption',
  'hostile_attrition',
  'siege_engineers',
  'fort_limit',
  'max_mercenary_stacks',
  'max_friends',
  'max_rivals',
  'retreat_delay',
  'war_exhaustion',
  'global_building_slot',
  'global_food_capacity',
  'global_goods_from_slaves',
  'global_settlement_building_slot',
  'subject_loyalty',
  'local_monthly_food',
  'diplomatic_reputation',
  'diplomatic_relations',
  'prominence',
  'subject_opinions',
  'support_for_character_as_heir',
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
  'agressive_expansion_impact',
  'agressive_expansion_monthly_change',
  'assassinate_attempt_cost_modifier',
  'army' + MOD_MAINTENANCE,
  'army_weight_modifier',
  'build_time',
  'build_expensive_roads_cost_modifier',
  'experience_decay',
  'cohort_cost',
  'current_corruption',
  'change_diplomatic_stance_cost_modifier',
  'change_governor_policy_cost_modifier',
  'deify_ruler_cost_modifier',
  'fort' + MOD_MAINTENANCE,
  'land_unit_attrition',
  'maintenance_cost',
  'naval_damage_taken',
  'navy' + MOD_MAINTENANCE,
  'naval_unit_attrition',
  'start_migration_cost_modifier',
  'price_state_investment_military_cost_modifier',
  'price_state_investment_oratory_cost_modifier',
  'price_state_investment_civic_cost_modifier',
  'price_state_investment_religious_cost_modifier',
  'retreat_delay',
  'slaves_move_cost_modifier',
  'global_goods_from_slaves',
  'ship' + MOD_COST,
  'loyalty_gain_chance',
  'omen_duration',
  'hold_triumph_cost_modifier',
  'war_exhaustion',
  'mercenary_land_maintenance_cost',
  'mercenary_naval_maintenance_cost',
  'monthly_wage_modifier',
  'monthly_governor_wage',
  'monthly_corruption',
  'recruit_mercenary_cost_modifier',
  'loyalty_gain_chance_modifier',
  'price_found_city_cost_modifier',
  'price_assemble_raiding_party_button_cost_modifier',
  'build_cost',
  'war_score_cost',
  'recruit_general_cost_modifier',
  'monthly_tyranny',
  'enact_law_cost_modifier',
  'inspire_disloyalty_cost_modifier',
  'stability_cost_modifier',
  'endorse_party_cost_modifier',
  'increase_legitimacy_cost_modifier',
  'price_oaths_of_allegiance_button_cost_modifier',
  'loyalty_to_overlord',
  'smear_character_cost_modifier',
  'fortress_building_cost',
  'war_no_cb_cost_modifier'
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
 */
exports.loadScriptValue = scriptValue => {
  Object.assign(scriptValues, scriptValue)
}

/** Merges land and naval modifiers with the same value to a global modifier.
 * @param {[]} modifiers
 */
exports.mergeModifiers = modifiers => {
  const landModifiers = modifiers.filter(item => item.target === LAND)
  const landDict = {}
  landModifiers.forEach(item => (landDict[item.attribute] = item.value))
  const navalModifiers = modifiers.filter(item => item.target === NAVAL)
  const navalDict = {}
  navalModifiers.forEach(item => (navalDict[item.attribute] = item.value))
  Object.keys(landDict).forEach(attribute => {
    if (landDict[attribute] === navalDict[attribute]) {
      const modifier = modifiers.find(item => item.attribute === attribute && item.target === LAND)
      modifier.target = GLOBAL
      const index = modifiers.findIndex(item => item.attribute === attribute && item.target === NAVAL)
      modifiers.splice(index, 1)
    }
  })
}
