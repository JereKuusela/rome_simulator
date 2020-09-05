const DISCIPLINE = 'Discipline'
const OFFENSE = 'Offense'
const DEFENSE = 'Defense'
const MOD_MAINTENANCE = '_maintenance_cost'
const MAINTENANCE = 'Maintenance'
const MOD_COST = '_cost'
const COST = 'Cost'
const MOD_MODIFIER = '_modifier'
const MOD_MORALE = '_morale'
const MORALE = 'Morale'
const MANEUVER = 'Maneuver'
const PARENT = 'Parent'
const FIRE = 'Fire'
const SHOCK = 'Shock'
const GLOBAL = 'Global'
const LAND = 'Land'
const TEXT = 'Text'
const COUNTRY = 'Country'
const GENERAL = 'General'

/** @type {Object.<string, string>} */
const localizations = {
}

/** @type {Object.<string, number>} */
const scriptValues = {
}

const generalStats = ['martial', 'zeal', 'finesse', 'charisma', 'character_loyalty', 'monthly_character_wealth', 'health']

/** @type {Object.<string, string>} */
const units = {
  'artillery': 'Artillery',
  'cavalry': 'Cavalry',
  'infantry': 'Infantry'
}

/** @type {Object.<string, string>} */
const attributes = {
  'army': 'Mode',
  'category': PARENT,
  ['build' + MOD_COST]: COST,
  'combat_width': 'Combat Width',
  'defensive_fire': 'Defensive Fire Pips',
  ['defensive' + MOD_MORALE]: 'Defensive Morale Pips',
  'defensive_shock': 'Defensive Shock Pips',
  ['army' + MOD_MAINTENANCE]: MAINTENANCE,
  ['land' + MOD_MORALE]: MORALE,
  ['land' + MOD_MORALE + MOD_MODIFIER]: MORALE,
  'maintenance_cost': MAINTENANCE,
  'maneuver_value': MANEUVER,
  'military_tactics': 'Military Tactics',
  'morale': MORALE,
  'offensive_fire': 'Offensive Fire Pips',
  ['offensive' + MOD_MORALE]: 'Offensive Morale Pips',
  'offensive_shock': 'Offensive Shock Pips',
  'strength_damage_done': 'Strength Damage Done',
  'strength_damage_taken': 'Strength Damage Taken',
  'type': PARENT,
  'unit_type': 'Culture'
}

Object.keys(units).forEach(key => {
  const value = units[key]
  attributes[key] = value
  attributes[key + MOD_MORALE] = MORALE
  attributes[key + MOD_MAINTENANCE] = MAINTENANCE
  attributes[key + '_discipline'] = DISCIPLINE
  attributes[key + '_fire'] = FIRE
  attributes[key + '_shock'] = SHOCK
  attributes[key + MOD_COST] = COST
})

/** @type {Object.<string, string>} */
const targets = {
  ['army' + MOD_MAINTENANCE]: LAND,
  'combat_width': COUNTRY,
  'discipline': GLOBAL,
  ['land' + MOD_MORALE]: LAND,
  ['land' + MOD_MORALE + MOD_MODIFIER]: LAND,
  'maintenance_cost': GLOBAL,
  'maneuver_value': GLOBAL,
  'military_tactics': GLOBAL,
  'morale': GLOBAL
}

Object.keys(units).forEach(key => {
  const value = units[key]
  targets[key + MOD_MORALE] = value
  targets[key + MOD_MAINTENANCE] = value
  targets[key + '_discipline'] = value
  targets[key + '_fire'] = value
  targets[key + '_shock'] = value
  targets[key + MOD_COST] = value
})

const noPercents = new Set([
  'combat_width',
  'land' + MOD_MORALE,
  'morale',
  'military_tactics',
  'naval' + MOD_MORALE,
  'general_loyalty',
  'admiral_loyalty',
  'hostile_attrition',
  'siege_engineers',
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
  let attribute = attributes[key] || localizations['modifier_' + key] || localizations[key]
  if (attribute && attribute.startsWith('$')) {
    key = attribute.substr(1, attribute.length - 2)
    attribute = attributes[key] || localizations['modifier_' + key] || localizations[key]
  }
  switch (key) {
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
exports.getNoPercent = key => noPercents.has(key) ? true : undefined
/**
 * @param {string} key 
 * @param {string} value 
 */
exports.getNegative = (key, value) => typeof value === 'number' && negatives.has(key) === value >= 0 ? true : undefined
/**
 * @param {string} key 
 */
exports.getType = key => types.has(key) ? MODIFIER : BASE
/**
 * @param {string} key 
 * @param {string} value 
 */
exports.getValue = (key, value) => {
  if (Array.isArray(value))
    value = value[0]
  if (typeof value === 'string' && scriptValues[value])
    value = scriptValues[value]
  switch (key) {
    case 'type':
      return exports.getAttribute(value)
    case 'unit_type':
      return exports.format(value)
    default:
      return value
  }
}

/** @type {Object<string, string>} */
let countries = {}

exports.getCountries = () => countries

/**
 * @param {Object<string, string>} localization 
 * @param {string} file 
 */
exports.loadLocalization = (localization, file) => {
  Object.assign(localizations, localization)
}

/**
 * @param {{}} scriptValue
 * @param {string} file 
 */
exports.loadScriptValue = (scriptValue) => {
  Object.assign(scriptValues, scriptValue)
}
