const path = require('path')
const fs = require('fs')
const converter = require('../parser')
const { getAttribute, getValue, loadLocalization, loadScriptValue } = require('./modifiers')
const { readFiles, writeFile, sort } = require('./../core')
const directoryPath = path.join(__dirname, '../../../conversion')
const resultPath = path.join(__dirname, '../../../src/data/json')

exports.readFiles = (handlers) => readFiles(directoryPath, handlers)
exports.sort = sort
exports.writeFile = (filename, results) => writeFile(path.join(resultPath, filename), results)

exports.forEach = (object, callback) => object && Object.keys(object).forEach(key => callback(key, object[key]))

exports.set = (object, tuple) => object[tuple[0]] = tuple[1]

exports.setValues = (object, target) => {
  this.forEach(object, (key, value) => {
    this.set(target, this.get(key, value))
  })
}

exports.get = (key, value) => {
  if (value === undefined)
    return getAttribute(key)
  return [getAttribute(key), getValue(key, value)]
}

exports.clean = (object) => {
  Object.keys(object).forEach(key => {
    if (key === 'undefined' || !object[key])
      delete object[key]
  })
}

exports.cleanResults = (results) => {
  this.forEach(results, (_, sub) => this.clean(sub))
  return results
}

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
 * Loads localization files.
 */
exports.loadLocalizations = () => {
  const directory = path.join(directoryPath, 'ck3', 'localization', 'english')
  loadDirectory(directory)
}

const loadDirectory = directory => {
  const files = fs.readdirSync(directory)
  files.forEach(file => {
    if (path.extname(file)) {
      const data = fs.readFileSync(path.join(directory, file)).toString()
      const localization = converter.parseLocalization(data)
      loadLocalization(localization, file)
    }
    else {
      loadDirectory(path.join(directory, file))
    }
  })
}

/**
 * Loads script values.
 */
exports.loadScriptValues = () => {
  const directory = path.join(directoryPath, 'ck3', 'script_values')
  const files = fs.readdirSync(directory)
  files.forEach(file => {
    const data = fs.readFileSync(path.join(directory, file)).toString()
    const localization = converter.parseScriptValues(data)
    loadScriptValue(localization, file)
  })
}