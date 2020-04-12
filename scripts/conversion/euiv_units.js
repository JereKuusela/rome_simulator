const core = require('./core')
const path = require('path')

const convertKey = key =>  {
  switch (key) {
    case 'unit_type':
      return 'culture'
    case 'type':
      return 'parent'
    default:
      return key
  }
}

const TECH_FILE = 'mil.txt'
let tech_level = -1

const handleTech = (results, data) => {
  if (key === 'technology')
    tech_level++
  else if (key === 'enable')
    result[core.format(value)] = tech_level
}

const handleUnit = (results, data) => {
  result[convertKey(key)] = value
}

const transformer = result => {
  const techLevels = result[TECH_FILE]
  Object.keys(result).forEach(key => {
    const unit = result[key]
    unit['type'] = core.format(key)
    unit['tech'] = techLevels[unit.type] || 0
    Object.keys(unit).forEach(key => {
      if (key === 'maneuver' || !unit[key])
        delete unit[key]
    })
  })
  delete result[TECH_FILE]
  return Object.values(result)
}

const parsers = {
  [path.join('euiv', 'units')]: handleUnit,
  [path.join('euiv', 'tech', TECH_FILE)]: handleTech
}

exports.run = () => core.parseFiles(parsers, transformer, path.join('euiv', 'units.json'))
