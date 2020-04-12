const core = require('./core')
const path = require('path')
const modifiers = require('./modifiers')

let tech_level = -1

const handleTech = (results, data) => {
  const levels = data.technology
  levels.forEach((values, level) => {
    result[level] = {
      name: 'Level ' + level,
      modifiers: []
    }
    Object.keys(values).forEach(key => {
      const value = values[key]
      if (modifiers.getAttribute(key))
        unit[modifiers.getAttribute(key)] = convertValue(key, value)
    })
  })
  if (key === 'technology') {
    tech_level++
    result[tech_level] = {
      name: 'Level ' + tech_level,
      modifiers: []
    }
  }
  key = convertKey(key)
  if (key && tech_level > 0)
    result[tech_level].modifiers.push({
      target: getTarget(key),
      attribute: getAttribute(key),
      type: getType(key),
      no_percent: getPercent(key),
      value
    })
}

function transformer(result) {
  Object.keys(result).forEach(key => {
    result[key] = Object.values(result[key])
  })
  return Object.values(result)[0]
}

const parsers = {
  [path.join('euiv', 'tech', 'mil.txt')]: handleTech
}

exports.run = () => core.parseFiles(parsers, transformer, path.join('euiv', 'tech.json'))
