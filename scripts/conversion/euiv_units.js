const core = require('./core')
const path = require('path')
const modifiers = require('./modifiers')

const TECH_FILE = 'mil.txt'

const format = value => {
  if (!isNaN(value))
    return Number(value)
  value = path.parse(value).name
  let split = value.split('_')
  split = split.map(part => part[0].toUpperCase() + part.substring(1))
  return split.join(' ')
}

const handleTech = (results, data) => {
  results[TECH_FILE] = {}
  data.technology.forEach((values, level) => {
    if (!values.enable)
      return
    if (Array.isArray(values.enable)) {
      values.enable.forEach(unit => {
        results[TECH_FILE][format(unit)] = level
      })
    }
    else {
      results[TECH_FILE][format(values.enable)] = level
    }
  })
}

const handleUnit = (results, data, filename) => {
  const type = format(filename)
  const unit = {
    'Type': type
  }
  Object.keys(data).forEach(key => {
    const value = data[key]
    if (key === 'maneuver')
      return
    if (modifiers.getAttribute(key))
      unit[modifiers.getAttribute(key)] = modifiers.getValue(key, value)
  })
  if (!unit.Parent)
    return
  results[type] = unit
}

const transformer = results => {
  const techLevels = results[TECH_FILE]
  Object.keys(results).forEach(key => {
    const unit = results[key]
    unit['Tech'] = techLevels[unit.Type] || 0
  })
  delete results[TECH_FILE]
  return Object.values(results)
}

const parsers = {
  [path.join('euiv', 'units')]: handleUnit,
  [path.join('euiv', 'tech', TECH_FILE)]: handleTech
}

exports.run = () => core.parseFiles(parsers, transformer, path.join('euiv', 'units.json'))
