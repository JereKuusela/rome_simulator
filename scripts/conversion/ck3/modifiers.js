
/**
 * Default mapper based on localization.
 * Gives a starting point for mapping most attributes.
 * Returning undefined at getAttribute allows ignoring values.
 * @type {Object.<string, string>}
 */
const localizations = {}

/**
 * Scripts values are needed in some special situations.
 * @type {Object.<string, number>}
 */
const scriptValues = {}

/**
 * Custom mapper for attributes when localization doesn't fit.
 * @type {Object.<string, string>}
 */
const attributes = {
  'type': 'Parent',
  'damage': 'Damage',
  'toughness': 'Toughness',
  'pursuit': 'Pursuit',
  'screen': 'Screen',
  'stack': 'Strength',
  'icon': 'Icon'
}

/**
 * Mapper for base unit types.
 * Used to create attributes.
 * @type {Object.<string, string>}
*/
const baseTypes = {
  'skirmishers': 'Skirmishers',
  'archers': 'Archers',
  'light_cavalry': 'Light Cavalry',
  'heavy_cavalry': 'Heavy Cavalry',
  'pikemen': 'Pikemen',
  'heavy_infantry': 'Heavy Infantry',
  'siege_weapon': 'Siege Weapon'
}

Object.keys(baseTypes).forEach(key => {
  const value = baseTypes[key]
  attributes[key] = value
})

/**
 * @param {string} key 
 */
exports.getAttribute = (key) => {
  let attribute = attributes[key] || localizations['modifier_' + key] || localizations[key]
  switch (key) {
    default:
      return attribute
  }
}

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
    default:
      return value
  }
}

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
