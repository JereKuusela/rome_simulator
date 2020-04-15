const DISCIPLINE = 'Discipline'
const MAINTENANCE = 'Maintenance'
const COST = 'Cost'
const RECRUIT_SPEED = 'Recruit speed'
const EXPERIENCE = 'Experience'
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

const generalStats = {
  'martial': 'Martial',
  'zeal': 'Zeal',
  'finesse': 'Finesse',
  'chariasma': 'Charisma',
  'character_loyalty': 'Loyalty',
  'monthly_character_wealth': 'Monthly wealth',
  'health': 'Monthly health'
}

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
  'mega_galley': 'Mega Polyreme',
  'artillery': 'Artillery',
  'cavalry': 'Cavalry',
  'infantry': 'Infantry',
}

const attributes = {
  'assault_ability': 'Assault ability',
  'attrition_weight': 'Attrition weight',
  'army': 'Mode',
  'category': PARENT,
  'build_cost': 'Cost',
  'combat_width': 'Combat width',
  'defensive_fire': 'Defensive fire pips',
  'defensive_morale': 'Defensive morale pips',
  'defensive_shock': 'Defensive shock pips',
  'heavy': 'Heavy Ship',
  'light': 'Light Ship',
  'army_maintenance_cost': MAINTENANCE,
  'army_movement_speed': LAND + ' Movement speed',
  'army_weight_modifier': 'Attrition weight',
  'blockade_efficiency': 'Blockade efficiency',
  'cohort_reinforcement_speed': 'Land Reinforcement',
  'discipline': DISCIPLINE,
  'experience_decay': EXPERIENCE + ' decay',
  'food_consumption': 'Food consumption',
  'food_storage': 'Food storage',
  'fort_maintenance_cost': 'Fort maintenance',
  'general_loyalty': 'General loyalty',
  'global_cohort_recruit_speed': LAND + ' ' + RECRUIT_SPEED,
  'global_defensive': 'Fort defense',
  'global_start_experience': EXPERIENCE,
  'global_ship_recruit_speed': NAVAL + ' ' + RECRUIT_SPEED,
  'global_supply_limit_modifier': 'Supply limit',
  'hostile_attrition': 'Hostile attrition',
  'land_morale': MORALE,
  'land_morale_modifier': MORALE,
  'land_unit_attrition': 'Land Attrition',
  'loyalty_gain_chance': 'Loyalty chance',
  'maintenance_cost': MAINTENANCE,
  'maneuver': MANEUVER,
  'maneuver_value': MANEUVER,
  'medium': 'Medium Ship',
  'military_tactics': 'Military tactics',
  'morale': MORALE,
  'morale_damage_done': 'Morale damage done',
  'morale_damage_taken': 'Morale damage taken',
  'naval_damage_done': 'Damage done',
  'naval_damage_taken': 'Damage taken',
  'naval_morale': MORALE,
  'naval_morale_modifier': MORALE,
  'naval_range': 'Naval range',
  'naval_unit_attrition': 'Naval Attrition',
  'navy_movement_speed': NAVAL + ' Movement speed',
  'navy_maintenance_cost': MAINTENANCE,
  'offensive_fire': 'Offensive fire pips',
  'offensive_morale': 'Offensive morale pips',
  'offensive_shock': 'Offensive shock pips',
  'price_state_investment_military_cost_modifier': 'Military investment cost',
  'retreat_delay': 'Retreat delay',
  'ship_capture_chance': 'Capture chance',
  'ship_repair_at_sea': 'Ship repair at sea',
  'siege_ability': 'Siege ability',
  'siege_engineers': 'Siege engineers',
  'strength_damage_done': 'Strength damage done',
  'strength_damage_taken': 'Strength damage taken',
  'type': PARENT,
  'unit_type': 'Culture'
}

Object.keys(units).forEach(key => {
  const value = units[key]
  attributes[key] = value
  attributes[key + '_discipline'] = DISCIPLINE
  attributes[key + '_fire'] = FIRE
  attributes[key + '_shock'] = SHOCK
  attributes[key + '_cost'] = COST
})

Object.keys(generalStats).forEach(key => {
  const value = generalStats[key]
  attributes[key] = value
})

const targets = {
  'assault_ability': TEXT,
  'army_maintenance_cost': LAND,
  'army_movement_speed': TEXT,
  'army_weight_modifier': LAND,
  'blockade_efficiency': TEXT,
  'cohort_reinforcement_speed': TEXT,
  'combat_width': COUNTRY,
  'discipline': GLOBAL,
  'experience_decay': TEXT,
  'fort_maintenance_cost': TEXT,
  'general_loyalty': TEXT,
  'global_cohort_recruit_speed': TEXT,
  'global_defensive': TEXT,
  'global_start_experience': GLOBAL,
  'global_ship_recruit_speed': TEXT,
  'global_supply_limit_modifier': TEXT,
  'hostile_attrition': TEXT,
  'land_morale': LAND,
  'land_morale_modifier': LAND,
  'land_unit_attrition': TEXT,
  'loyalty_gain_chance': TEXT,
  'maintenance_cost': GLOBAL,
  'maneuver_value': GLOBAL,
  'military_tactics': GLOBAL,
  'morale': GLOBAL,
  'naval_damage_done': NAVAL,
  'naval_damage_taken': NAVAL,
  'naval_morale': NAVAL,
  'naval_morale_modifier': NAVAL,
  'naval_range': TEXT,
  'naval_unit_attrition': TEXT,
  'navy_movement_speed': TEXT,
  'navy_maintenance_cost': NAVAL,
  'price_state_investment_military_cost_modifier': TEXT,
  'retreat_delay': TEXT,
  'ship_capture_chance': NAVAL,
  'ship_repair_at_sea': TEXT,
  'siege_ability': TEXT,
  'siege_engineers': TEXT
}

Object.keys(generalStats).forEach(key => {
  targets[key] = GENERAL
})

Object.keys(units).forEach(key => {
  const value = units[key]
  targets[key + '_discipline'] = value
  targets[key + '_fire'] = value
  targets[key + '_shock'] = value
  targets[key + '_cost'] = value
})

const noPercents = {
  'combat_width': true,
  'land_morale': true,
  'morale': true,
  'military_tactics': true,
  'naval_morale': true,
  'general_loyalty': true,
  'hostile_attrition': true,
  'siege_engineers': true,
  'retreat_delay': true
}

Object.keys(generalStats).forEach(key => {
  noPercents[key] = true
})

const negatives = {
  'army_maintenance_cost': true,
  'army_weight_modifier': true,
  'experience_decay': true,
  'fort_maintenance_cost': true,
  'land_unit_attrition': true,
  'maintenance_cost': true,
  'naval_damage_taken': true,
  'navy_maintenance_cost': true,
  'naval_unit_attrition': true,
  'price_state_investment_military_cost_modifier': true,
  'retreat_delay': true,
  'loyalty_gain_chance': true
}

const MODIFIER = 'Modifier'

const types = {
  'army_maintenance_cost': MODIFIER,
  'army_weight_modifier': MODIFIER,
  'maintenance_cost': MODIFIER,
  'maneuver_value': MODIFIER,
  'navy_maintenance_cost': MODIFIER
}

/**
 * 
 * @param {string} value 
 */
const format = value => {
  let split = value.split('_')
  split = split.map(part => part[0].toUpperCase() + part.substring(1))
  return split.join(' ')
}

exports.format = format

/**
 * @param {string} key 
 */
exports.getAttribute = getAttribute = key => attributes[key]
/**
 * @param {string} key 
 */
exports.getTarget = getTarget = key => targets[key]
/**
 * @param {string} key 
 */
exports.getNoPercent = getNoPercent = key => noPercents[key]
/**
 * @param {string} key 
 * @param {string} value 
 */
exports.getNegative = getNegative = (key, value) => !!negatives[key] === value > 0 ? true : undefined
/**
 * @param {string} key 
 */
exports.getType = getType = key => types[key]
/**
 * @param {string} key 
 * @param {string} value 
 */
exports.getValue = getValue = (key, value) => {
  switch (key) {
    case 'global_start_experience':
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
      return getAttribute(value)
    case 'unit_type':
      return format(value)
    case 'is_flank':
      return value === 'Yes' ? 'Flank' : ''
    case 'support':
      return value === 'Yes' ? 'Support' : ''
    default:
      return value
  }
}

