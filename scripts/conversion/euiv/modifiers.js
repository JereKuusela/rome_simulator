
const MAINTENANCE = '_maintenance'
const LAND = 'land'
const MODIFIER = '_modifier'
const MORALE = '_morale'
const MANEUVER = 'Maneuver'
const COST = '_cost'
const PARENT = 'Parent'
const COMBAT_ABILITY = '_power'
const OFFENSE = 'offensive'
const DEFENSE = 'defensive'
const FIRE = '_fire'
const SHOCK = '_shock'
const ATTR_COST = 'Cost'
const ATTR_MORALE = 'Morale'
const ATTR_MAINTENANCE = 'Maintenance'
const ATTR_DISCIPLINE = 'Discipline'
const ATTR_COMBAT_ABILITY = 'Combat Ability'
const ATTR_FIRE = 'Fire'
const ATTR_SHOCK = 'Shock'
const TARGET_LAND = 'Land'
const TEXT = 'Text'
const COUNTRY = 'Country'

/** @type {Object.<string, string>} */
const localizations = {
}

/** @type {Object.<string, number>} */
const scriptValues = {
}

/** @type {Object.<string, string>} */
const units = {
  'artillery': 'Artillery',
  'cavalry': 'Cavalry',
  'infantry': 'Infantry'
}

/** @type {Object.<string, string>} */
const attributes = {
  'combat_width': 'Combat Width',
  'discipline': ATTR_DISCIPLINE,
  [DEFENSE + FIRE]: 'Defensive Fire Pips',
  [DEFENSE + MORALE]: 'Defensive Morale Pips',
  [DEFENSE + SHOCK]: 'Defensive Shock Pips',
  'global_regiment_cost': ATTR_COST,
  [LAND + MAINTENANCE + MODIFIER]: ATTR_MAINTENANCE,
  [LAND + MORALE]: ATTR_MORALE,
  'maneuver_value': MANEUVER,
  'military_tactics': 'Military Tactics',
  'morale': ATTR_MORALE,
  [OFFENSE + FIRE]: 'Offensive Fire Pips',
  [OFFENSE + MORALE]: 'Offensive Morale Pips',
  [OFFENSE + SHOCK]: 'Offensive Shock Pips',
  'type': PARENT,
  'unit_type': 'Culture'
}

Object.keys(units).forEach(key => {
  const value = units[key]
  attributes[key] = value
  attributes[key + FIRE] = ATTR_FIRE
  attributes[key + SHOCK] = ATTR_SHOCK
  attributes[key + COST] = ATTR_COST
  attributes[key + COMBAT_ABILITY] = ATTR_COMBAT_ABILITY
})

/** @type {Object.<string, string>} */
const targets = {
  [LAND + MAINTENANCE + MODIFIER]: TARGET_LAND,
  'combat_width': COUNTRY,
  'discipline': TARGET_LAND,
  'global_regiment_cost': TARGET_LAND,
  [LAND + MORALE]: TARGET_LAND,
  'maintenance_cost': TARGET_LAND,
  'maneuver_value': TARGET_LAND,
  'military_tactics': TARGET_LAND,
  'morale': TARGET_LAND
}

Object.keys(units).forEach(key => {
  const value = units[key]
  targets[key + FIRE] = value
  targets[key + SHOCK] = value
  targets[key + COST] = value
  targets[key + COMBAT_ABILITY] = value
})

const noPercents = new Set([
  'combat_width',
  LAND + MORALE,
  'military_tactics'
])

const negatives = new Set([
  LAND + MAINTENANCE + MODIFIER,
  'global_regiment_cost'
])

Object.keys(units).forEach(key => {
  negatives.add(key + COST)
})

const TYPE_BASE = 'Base'
const TYPE_MODIFIER = 'Modifier'

const types = new Set([
  LAND + MAINTENANCE + MODIFIER,
  'global_regiment_cost',
  'maneuver_value'
])

Object.keys(units).forEach(key => {
  types.add(key + COST)
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
exports.getType = key => types.has(key) ? TYPE_MODIFIER : TYPE_BASE
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
