const DISCIPLINE = 'Discipline'
const OFFENSE = 'Offense'
const DEFENSE = 'Defense'
const MOD_MAINTENANCE = '_maintenance_cost'
const MAINTENANCE = 'Maintenance'
const MOD_COST = '_cost'
const COST = 'Cost'
const EXPERIENCE = 'Experience'
const MOD_MODIFIER = '_modifier'
const MOD_MORALE = '_morale'
const MORALE = 'Morale'
const MANEUVER = 'Maneuver'
const PARENT = 'Parent'
const FIRE = 'Fire'
const SHOCK = 'Shock'
const GLOBAL = 'Global'
const NAVAL = 'Naval'
const LAND = 'Land'
const TEXT = 'Text'
const COUNTRY = 'Country'
const GENERAL = 'General'

/** @type {Object.<string, string>} */
const localizations = {
}

/** @type {Object.<string, string>} */
const generalStats = {
  'martial': 'Martial',
  'zeal': 'Zeal',
  'finesse': 'Finesse',
  'chariasma': 'Charisma',
  'character_loyalty': 'Loyalty',
  'monthly_character_wealth': 'Monthly Wealth',
  'health': 'Monthly Health'
}

/** @type {Object.<string, string>} */
const units = {
  'archers': 'Archers',
  'camels': 'Camel Cavalry',
  'chariots': 'Chariots',
  'horse_archers': 'Horse Archers',
  'heavy_infantry': 'Heavy Infantry',
  'heavy_cavalry': 'Heavy Cavalry',
  'light_cavalry': 'Light Cavalry',
  'light_infantry': 'Light Infantry',
  'supply_train': 'Supply Train',
  'warelephant': 'War Elephants',
  'liburnian': 'Liburnian',
  'trireme': 'Trireme',
  'tetrere': 'Tetrere',
  'hexere': 'Hexere',
  'octere': 'Octere',
  'mega_galley': 'Mega-Polyreme',
  'artillery': 'Artillery',
  'cavalry': 'Cavalry',
  'infantry': 'Infantry',
}

/** @type {Object.<string, string>} */
const attributes = {
  'attrition_weight': 'Attrition Weight',
  'army': 'Mode',
  'category': PARENT,
  ['build' + MOD_COST]: COST,
  'combat_width': 'Combat Width',
  'defensive_fire': 'Defensive Fire Pips',
  ['defensive' + MOD_MORALE]: 'Defensive Morale Pips',
  'defensive_shock': 'Defensive Shock Pips',
  'heavy': 'Heavy Ship',
  'light': 'Light Ship',
  ['army' + MOD_MAINTENANCE]: MAINTENANCE,
  'army_weight_modifier': 'Attrition Weight',
  'discipline': DISCIPLINE,
  'experience_decay': EXPERIENCE + ' Decay',
  'food_consumption': 'Food Consumption',
  'food_storage': 'Food Storage',
  'global_cohort_start_experience': EXPERIENCE,
  'global_start_experience': EXPERIENCE,
  ['land' + MOD_MORALE]: MORALE,
  ['land' + MOD_MORALE + MOD_MODIFIER]: MORALE,
  MOD_MAINTENANCE: MAINTENANCE,
  'maneuver': MANEUVER,
  'maneuver_value': MANEUVER,
  'medium': 'Medium Ship',
  'military_tactics': 'Military Tactics',
  'morale': MORALE,
  'morale_damage_done': 'Morale Damage Done',
  'morale_damage_taken': 'Morale Damage Taken',
  'naval_damage_done': 'Damage Done',
  'naval_damage_taken': 'Damage Taken',
  ['naval' + MOD_MORALE]: MORALE,
  ['naval' + MOD_MORALE + MOD_MODIFIER]: MORALE,
  ['navy' + MOD_MAINTENANCE]: MAINTENANCE,
  'offensive_fire': 'Offensive Fire Pips',
  ['offensive' + MOD_MORALE]: 'Offensive Morale Pips',
  'offensive_shock': 'Offensive Shock Pips',
  ['ship' + MOD_COST]: COST,
  'ship_capture_chance': 'Capture Chance',
  'ship_repair_at_sea': 'Ship Repair at Sea',
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
  attributes[key + '_offensive'] = OFFENSE
  attributes[key + '_defensive'] = DEFENSE
  attributes[key + '_fire'] = FIRE
  attributes[key + '_shock'] = SHOCK
  attributes[key + MOD_COST] = COST
})

Object.keys(generalStats).forEach(key => {
  const value = generalStats[key]
  attributes[key] = value
})

/** @type {Object.<string, string>} */
const targets = {
  ['army' + MOD_MAINTENANCE]: LAND,
  'army_weight_modifier': LAND,
  'combat_width': COUNTRY,
  'discipline': GLOBAL,
  'global_cohort_start_experience': LAND,
  'global_start_experience': GLOBAL,
  ['land' + MOD_MORALE]: LAND,
  ['land' + MOD_MORALE + MOD_MODIFIER]: LAND,
  MOD_MAINTENANCE: GLOBAL,
  'maneuver_value': GLOBAL,
  'military_tactics': GLOBAL,
  'morale': GLOBAL,
  'naval_damage_done': NAVAL,
  'naval_damage_taken': NAVAL,
  ['naval' + MOD_MORALE]: NAVAL,
  ['naval' + MOD_MORALE + MOD_MODIFIER]: NAVAL,
  ['navy' + MOD_MAINTENANCE]: NAVAL,
  ['ship' + MOD_COST]: NAVAL,
  'ship_capture_chance': NAVAL
}

Object.keys(generalStats).forEach(key => {
  targets[key] = GENERAL
})

Object.keys(units).forEach(key => {
  const value = units[key]
  targets[key + MOD_MORALE] = value
  targets[key + MOD_MAINTENANCE] = value
  targets[key + '_discipline'] = value
  targets[key + '_offensive'] = value
  targets[key + '_defensive'] = value
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
  'subject_loyalty'
])

Object.keys(generalStats).forEach(key => {
  noPercents.add(key)
})

const negatives = new Set([
  'army' + MOD_MAINTENANCE,
  'army_weight_modifier',
  'experience_decay',
  'fort' + MOD_MAINTENANCE,
  'land_unit_attrition',
  MOD_MAINTENANCE,
  'naval_damage_taken',
  'navy' + MOD_MAINTENANCE,
  'naval_unit_attrition',
  'price_state_investment_military_cost_modifier',
  'retreat_delay',
  'ship' + MOD_COST,
  'loyalty_gain_chance',
  'hold_triumph_cost_modifier',
  'war_exhaustion',
  'mercenary_land_maintenance_cost',
  'recruit_mercenary_cost_modifier'
])

Object.keys(units).forEach(key => {
  negatives.add(key + MOD_COST)
  negatives.add(key + MOD_MAINTENANCE)
})

const MODIFIER = 'Modifier'

const types = new Set([
  'army' + MOD_MAINTENANCE,
  'army_weight_modifier',
  'land' + MOD_MORALE + MOD_MODIFIER,
  MOD_MAINTENANCE,
  'maneuver_value',
  'navy' + MOD_MAINTENANCE,
  'naval' + MOD_MORALE + MOD_MODIFIER,
  'ship' + MOD_COST
])

Object.keys(units).forEach(key => {
  types.add(key + '_morale')
  types.add(key + '_cost')
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
 */
exports.getAttribute = (key, value) => {
  if (key === 'mercenary_land_maintenance_cost')
    key = 'modifier_land_mercenary_maintenance_cost'
  const attribute = attributes[key] || localizations[key] || localizations['modifier_' + key]
  switch (key) {
    case 'allow_unit_type':
    case 'enable_ability':
    case 'enable_tactic':
      return attribute.replace('$WHICH|Y$', attributes[value] || localizations[value])
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
exports.getType = key => types.has(key) ? MODIFIER : undefined
/**
 * @param {string} key 
 * @param {string} value 
 */
exports.getValue = (key, value) => {
  switch (key) {
    case 'allow_unit_type':
    case 'enable_ability':
    case 'enable_tactic':
      return 0
    case 'cohort_start_experience':
    case 'global_cohort_start_experience':
      return value * 0.01
    case 'army':
      return value === 'yes' ? 'Land' : 'Naval'
    case 'build_cost':
      return value.gold
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
    case 'liburnian':
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
    case 'unit_type':
      return exports.format(value)
    case 'is_flank':
      return value === 'Yes' ? 'Flank' : ''
    case 'support':
      return value === 'Yes' ? 'Support' : ''
    default:
      return value
  }
}

/**
 * @param {{}} localization 
 * @param {string} file 
 */
exports.loadLocalization = (localization, file) => {
  Object.assign(localizations, localization)
  if (file === 'terrains_l_english.yml') {
    Object.keys(units).forEach(unit => {
      Object.keys(localization).filter(terrain => !terrain.endsWith('_desc')).forEach(terrain => {
        attributes[unit + '_' + terrain + '_combat_bonus'] = localization[terrain]
        targets[unit + '_' + terrain + '_combat_bonus'] = units[unit]
      })
    })
  }
}