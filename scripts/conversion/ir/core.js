/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const fs = require('fs')
const converter = require('../parser')
const modifiers = require('./modifiers')
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
  target: modifiers.getTarget(key),
  attribute: modifiers.getAttribute(key, value),
  type: modifiers.getType(key),
  negative: modifiers.getNegative(key, value),
  noPercent: modifiers.getNoPercent(key),
  value: modifiers.getValue(key, value)
})

/**
 * Converts modifiers.
 * @returns {Modifier[]}
 */
exports.getModifiers = modifiers =>
  modifiers ? Object.keys(modifiers).map(key => exports.getModifier(key, modifiers[key])) : []

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
      modifiers.loadLocalization(localization, file)
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
    modifiers.loadScriptValue(localization, file)
  })
}
