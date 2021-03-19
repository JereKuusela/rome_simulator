/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const fs = require('fs')
const converter = require('../parser')
const {
  getTarget,
  getAttribute,
  getType,
  getNegative,
  getNoPercent,
  getValue,
  loadLocalization,
  loadScriptValue
} = require('./modifiers')
const { readFiles, writeFile, sort } = require('./../core')
const directoryPath = path.join(__dirname, '../../../conversion')
const resultPath = path.join(__dirname, '../../../src/data/json')

exports.readFiles = handlers => readFiles(directoryPath, handlers)
exports.sort = sort
exports.writeFile = (filename, results) => writeFile(path.join(resultPath, filename), results)

/**
 * Modifier object
 * @typedef {Object} Modifier
 * @property {string} target
 * @property {string} target
 * @property {string} type
 * @property {boolean} [negative]
 * @property {boolean} [no_percent]
 * @property {string|number} value
 */

/**
 * Converts key and value to a modifier object.
 * @param key {string}
 * @param value {string}
 * @returns {Modifier}
 */
exports.getModifier = (key, value) => ({
  target: getTarget(key),
  attribute: getAttribute(key, value),
  type: getType(key),
  negative: getNegative(key, value),
  noPercent: getNoPercent(key),
  value: getValue(key, value)
})

/**
 * Converts modifiers.
 * @returns {Modifier[]}
 */
exports.getModifiers = (modifiers, ignoredKeys = []) =>
  modifiers
    ? Object.keys(modifiers)
        .filter(key => !ignoredKeys.includes(key))
        .map(key => exports.getModifier(key, modifiers[key]))
    : []

/**
 * Returnws whether modifiers contain any useful modifiers.
 * @returns {bool}
 */
exports.isRelevant = modifiers => modifiers.filter(modifier => modifier.target !== 'Text').length > 0

/**
 * Converts key and raw modifiers.
 * @param key {string}
 * @param value {[]}
 * @returns {{}}
 */
exports.convertEntry = (key, rawModifiers, parent = undefined, ignoredKeys = []) => {
  const modifiers = exports.getModifiers(rawModifiers, ignoredKeys)
  return {
    name: getAttribute(key) || key,
    key,
    relevant: exports.isRelevant(modifiers),
    modifiers,
    parent
  }
}

/**
 * File handler for nested entries.
 */
exports.handler2 = (results, data, ignoredKeys, convertName = false) => {
  Object.keys(data).forEach(key => {
    const group = data[key]
    const parentName = (convertName && getAttribute(key)) || key
    Object.keys(group).forEach(key => {
      if (ignoredKeys.includes(key)) return
      const entry = group[key]
      results.push(exports.convertEntry(key, entry.modifier, parentName))
    })
  })
}

/**
 * Loads localization files.
 */
exports.loadLocalizations = () => {
  const directory = path.join(directoryPath, 'ir', 'localization', 'english')
  loadDirectory(directory)
}

const loadDirectory = directory => {
  const files = fs.readdirSync(directory)
  files.forEach(file => {
    if (path.extname(file)) {
      const data = fs.readFileSync(path.join(directory, file)).toString()
      const localization = converter.parseLocalization(data)
      loadLocalization(localization, file)
    } else {
      loadDirectory(path.join(directory, file))
    }
  })
}

/**
 * Loads script values.
 */
exports.loadScriptValues = () => {
  const directory = path.join(directoryPath, 'ir', 'script_values')
  const files = fs.readdirSync(directory)
  files.forEach(file => {
    const data = fs.readFileSync(path.join(directory, file)).toString()
    const localization = converter.parseScriptValues(data)
    loadScriptValue(localization, file)
  })
}
