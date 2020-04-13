const core = require('./core')
const path = require('path')
const modifiers = require('./modifiers')

const handleTech = (results, data) => {
  const levels = data.technology
  levels.forEach((values, level) => {
    results[level] = {
      name: 'Level ' + level,
      modifiers: []
    }
    // Base values are already in base units.
    if (level === 0)
      return
    Object.keys(values).forEach(key => {
      const value = values[key]
      if (!modifiers.getAttribute(key))
        return
      results[level].modifiers.push(core.getModifier(key, value))
    })
  })
}

const transformer = result => Object.values(result)

const parsers = {
  [path.join('euiv', 'tech', 'mil.txt')]: handleTech
}

exports.run = () => core.parseFiles(parsers, transformer, path.join('euiv', 'tech.json'))
