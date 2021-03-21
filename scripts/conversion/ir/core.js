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
  loadScriptValue,
  mergeModifiers
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
 * Recursively converts a dictionary to a modifier array.
 * @returns {Modifier[]}
 */
exports.getModifiers = (modifiers, ignoredKeys = []) =>
  modifiers
    ? Object.keys(modifiers)
        .filter(key => !ignoredKeys.includes(key))
        .map(key => {
          const item = modifiers[key]
          if (typeof item === 'object') {
            return exports.getModifiers(item, ignoredKeys)
          }
          return [exports.getModifier(key, item)]
        })
        .flat()
    : []

/**
 * Returnws whether modifiers contain any useful modifiers.
 * @returns {bool}
 */
exports.isRelevant = modifiers => modifiers.filter(modifier => modifier.target !== 'Text').length > 0

/**
 * Converts key and raw modifiers.
 * @param key {string}
 * @param rawModifiers {[]}
 * @returns {{}}
 */
exports.convertEntry = (key, rawModifiers, parent = undefined, convertParentName = false, ignoredKeys = []) => {
  let modifiers = []
  if (Array.isArray(rawModifiers)) {
    modifiers = rawModifiers.map(modifiers => exports.getModifiers(modifiers, ignoredKeys)).flat()
  } else modifiers = exports.getModifiers(rawModifiers, ignoredKeys)
  mergeModifiers(modifiers)
  return {
    name: getAttribute(key) || key,
    key,
    relevant: exports.isRelevant(modifiers),
    modifiers,
    parent: (convertParentName && getAttribute(parent)) || parent
  }
}

/**
 * File handler for nested entries.
 */
exports.handler2 = (results, data, ignoredKeys, convertParentName = false) => {
  Object.keys(data).forEach(key => {
    const group = data[key]
    const parentName = key
    Object.keys(group).forEach(key => {
      if (ignoredKeys.includes(key)) return
      const entry = group[key]
      results.push(exports.convertEntry(key, entry.modifier, parentName, convertParentName))
    })
  })
}

/**
 * File handler for entries.
 * @param results {[]}
 * @param data {{}}
 * @param modifierCallback {(item: {}) => {}}
 * @param parentCallback {(item: {}) => {}}
 * @returns {void
 */
exports.handler1 = (results, data, modifierCallback = item => item.modifier, parentCallback, ignoredKeys = []) => {
  Object.keys(data).forEach(key => {
    const entry = data[key]
    results.push(
      exports.convertEntry(key, modifierCallback(entry), parentCallback && parentCallback(entry), false, ignoredKeys)
    )
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
