const DISCIPLINE = 'Discipline'
const MAINTENANCE = 'Maintenance'
const COST = 'Cost'
const RECRUIT_SPEED = 'Recruit speed'
const EXPERIENCE = 'Experience'
const MORALE = 'Morale'
const MANEUVER = 'Maneuver'
const FIRE = 'Fire'
const SHOCK = 'SHOCK'
const GLOBAL = 'Global'
const NAVAL = 'Naval'
const LAND = 'Land'
const TEXT = 'Text'
const COUNTRY = 'Country'
const A = 'Archers'
const CC = 'Camel Cavalry'
const C = 'Chariots'
const HA = 'Horse Archers'
const HI = 'Heavy Infantry'
const HC = 'Heavy Cavalry'
const LC = 'Light Cavalry'
const LI = 'Light Infantry'
const ST = 'Supply Train'
const WE = 'War Elephants'
const TET = 'Tetrere'
const TRI = 'Trireme'
const HEX = 'Hexere'
const LIB = 'Liburnian'
const OCT = 'Octere'
const MEG = 'Mega-Polyreme'
const INF = 'Infantry'
const CAV = 'Cavalry'
const ART = 'Artillery'


const attributes = {
  'artillery_fire': FIRE, 
  'artillery_shock': SHOCK, 
  'assault_ability': 'Assault ability',
  'attrition_weight': 'Attrition weight',
  'archers': A,
  'army': 'Mode',
  'category': 'Parent',
  'build_cost': 'Cost',
  'camels': CC,
  'cavalry_fire': FIRE, 
  'cavalry_shock': SHOCK, 
  'chariots': C,
  'combat_width': 'Combat width', 
  'heavy_cavalry': HC,
  'heavy_infantry': HI,
  'horse_archers': HA,
  'infantry_fire': FIRE, 
  'infantry_shock': SHOCK, 
  'light_cavalry': LC,
  'light_infantry': LI,
  'supply_train': ST,
  'warelephant': WE,
  'army_maintenance_cost': MAINTENANCE,
  'army_movement_speed': LAND + ' Movement speed',
  'army_weight_modifier': 'Attrition weight',
  'blockade_efficiency': 'Blockade efficiency',
  'discipline': DISCIPLINE,
  'experience_decay': EXPERIENCE + ' decay',
  'food_consumption': 'Food consumption',
  'food_storage': 'Food storage',
  'fort_maintenance_cost': 'Fort maintenance',
  'general_loyalty': 'General loyalty',
  'global_cohort_recruit_speed': LAND + ' ' + RECRUIT_SPEED,
  'global_defensive': 'Fort defense',
  'global_start_experience': EXPERIENCE,
  'global_ship_recruit_speed':  NAVAL + ' ' + RECRUIT_SPEED,
  'global_supply_limit_modifier': 'Supply limit',
  'hexere': HEX,
  'hexere_discipline': DISCIPLINE,
  'heavy_cavalry_discipline': DISCIPLINE,
  'heavy_infantry_cost': COST,
  'heavy_infantry_discipline': DISCIPLINE,
  'hostile_attrition': 'Hostile attrition',
  'land_morale': MORALE,
  'liburnian': LIB,
  'liburnian_discipline': DISCIPLINE,
  'maintenance_cost': MAINTENANCE,
  'maneuver': MANEUVER,
  'maneuver_value': MANEUVER,
  'military_tactics': 'Military tactics',
  'mega_galley': MEG,
  'morale': MORALE,
  'morale_damage_done': 'Morale damage done',
  'morale_damage_taken': 'Morale damage taken',
  'naval_damage_done': 'Damage dpme',
  'naval_damage_taken': 'Damage taken',
  'naval_morale': MORALE,
  'naval_range': 'Naval range',
  'naval_unit_attrition': 'Naval Attrition',
  'navy_maintenance_cost': MAINTENANCE,
  'octere': OCT,
  'price_state_investment_military_cost_modifier': 'Military investment cost',
  'retreat_delay': 'Retreat delay',
  'siege_ability': 'Siege ability',
  'siege_engineers': 'Siege engineers',
  'strength_damage_done': 'Strength damage done',
  'strength_damage_taken': 'Strength damage taken',
  'tetrere': TET,
  'tetrere_discipline': DISCIPLINE,
  'trireme': TRI,
  'trireme_discipline': DISCIPLINE,
}

const targets = {
  'artillery_fire': ART, 
  'artillery_shock': ART, 
  'assault_ability': TEXT,
  'army_maintenance_cost': LAND,
  'army_movement_speed': TEXT,
  'army_weight_modifier': LAND,
  'blockade_efficiency': GLOBAL,
  'cavalry_fire': CAV, 
  'cavalry_shock': CAV, 
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
  'hexere_discipline': HEX,
  'hostile_attrition': TEXT,
  'heavy_cavalry_discipline': HC,
  'heavy_infantry_cost': HI,
  'heavy_infantry_discipline': HI,
  'infantry_fire': INF, 
  'infantry_shock': INF, 
  'land_morale': GLOBAL,
  'liburnian_discipline': LIB,
  'maintenance_cost': GLOBAL,
  'maneuver_value': GLOBAL,
  'military_tactics': GLOBAL,
  'morale': GLOBAL,
  'naval_damage_done': NAVAL,
  'naval_damage_taken': NAVAL,
  'naval_morale': NAVAL,
  'naval_range': TEXT,
  'naval_unit_attrition': TEXT,
  'navy_maintenance_cost': NAVAL,
  'price_state_investment_military_cost_modifier': TEXT,
  'retreat_delay': TEXT,
  'siege_ability': TEXT,
  'siege_engineers': TEXT,
  'tetrere_discipline': TET,
  'trireme_discipline': TRI,
}

const noPercents = {
  'combat_width': true,
  'land_morale': true,
  'morale': true,
  'military_tactics': true,
  'naval_morale': true,
  'general_loyalty': true,
  'hostile_attrition': true,
}

const negatives = {
  'army_maintenance_cost': true,
  'army_weight_modifier': true,
  'experience_decay': true,
  'fort_maintenance_cost': true,
  'hostile_attrition': true,
  'maintenance_cost': true,
  'naval_damage_taken': true,
  'navy_maintenance_cost': true,
  'naval_unit_attrition': true,
  'price_state_investment_military_cost_modifier': true,
  'retreat_delay': true,
}

const MODIFIER = 'modifier'

const types = {
  'army_maintenance_cost': MODIFIER,
  'army_weight_modifier': MODIFIER,
  'maintenance_cost': MODIFIER,
  'maneuver_value': MODIFIER,
  'navy_maintenance_cost': MODIFIER
}

const multipliers = {
  'global_start_experience': 0.01
}


exports.getAttribute = getAttribute = key => attributes[key]
exports.getTarget = getTarget = key => targets[key]
exports.getNoPercent = getNoPercent = key => noPercents[key]
exports.getNegative = getNegative = key => negatives[key]
exports.getType = getType = key => types[key]
exports.getMultiplier = getMultiplier = key => multipliers[key] || 1.0
