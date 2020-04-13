const path = require('path')
const fs = require('fs')
const converter = require('./parser')
const modifiers = require('./modifiers')
const directoryPath = path.join(__dirname, '../../conversion')
const resultPath = path.join(__dirname, '../../src/data/json')

const parseFile = (file, parser, results) => {
  const data = fs.readFileSync(path.join(directoryPath, file)).toString()
  parser(results, converter.parseFile(data), file)
}

const parseFiles = (parser, directory, results) => {
  if (path.parse(directory).ext)
    parseFile(directory, parser, results)
  else {
    const files = fs.readdirSync(path.join(directoryPath, directory))
    files.forEach(file => parseFile(path.join(directory, file), parser, results))
  }
}

exports.parseFiles = (parsers, transformer, filename) => {
  const results = {}
  Object.keys(parsers).map(key => parseFiles(parsers[key], key, results))
  const text = JSON.stringify({
    [path.parse(filename).name]: transformer(results)
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
  attribute: modifiers.getAttribute(key),
  type: modifiers.getType(key),
  negative: modifiers.getNegative(key, value),
  no_percent: modifiers.getNoPercent(key),
  value: modifiers.getValue(key, value)
})