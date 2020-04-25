const path = require('path')
const fs = require('fs')
const converter = require('./parser')
const modifiers = require('./modifiers')
const directoryPath = path.join(__dirname, '../../conversion')
const resultPath = path.join(__dirname, '../../src/data/json')

const parseFile = (file, parser) => {
  const data = fs.readFileSync(path.join(directoryPath, file)).toString()
  parser(converter.parseFile(data), file)
}

const parseFiles = (parser, directory) => {
  if (path.parse(directory).ext)
    parseFile(directory, parser)
  else {
    const files = fs.readdirSync(path.join(directoryPath, directory))
    files.forEach(file => parseFile(path.join(directory, file), parser))
  }
}

exports.readFiles = (handlers) => {
  Object.keys(handlers).map(key => parseFiles(handlers[key], key))
}

exports.writeFile = (results, filename) => {
  const text = JSON.stringify({
    [path.parse(filename).name]: results
  }, undefined, 2)
  const file = path.join(resultPath, filename)
  fs.writeFile(file, text, err => {
    if (err)
      throw err
    console.log(file)
  })
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
  no_percent: modifiers.getNoPercent(key),
  value: modifiers.getValue(key, value)
})

/**
 * Loads localization files for a given game.
 * @param game {string}
 */
exports.loadLocalizations = game => {
  const directory = path.join(directoryPath, game, 'localization', 'english')
  loadDirectory(directory)
}

const loadDirectory = directory => {
  const files = fs.readdirSync(directory)
  files.forEach(file => {
    if (path.extname(file)) {
      const data = fs.readFileSync(path.join(directory, file)).toString()
      const localization = converter.parseLocalization(data)
      modifiers.loadLocalization(localization, file)
    }
    else {
      loadDirectory(path.join(directory, file))
    }
  })
}

/**
 * Loads script values for a given game.
 * @param game {string}
 */
exports.loadScriptValues = game => {
  const directory = path.join(directoryPath, game, 'script_values')
  const files = fs.readdirSync(directory)
  files.forEach(file => {
    const data = fs.readFileSync(path.join(directory, file)).toString()
    const localization = converter.parseScriptValues(data)
    modifiers.loadScriptValue(localization, file)
  })
}