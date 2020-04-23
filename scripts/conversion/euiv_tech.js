const { readFiles, writeFile, getModifier } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')

const results = []

const handler = data => {
  const levels = data.technology
  levels.forEach((values, level) => {
    const entity = {
      name: 'Level ' + level,
      modifiers: []
    }
    // Base values are already in base units.
    if (level > 0) {
      Object.keys(values).forEach(key => {
        const value = values[key]
        if (!getAttribute(key))
          return
        entity.modifiers.push(getModifier(key, value))
      })
    }
    results.push(entity)
  })
}

const handlers = {
  [path.join('euiv', 'tech', 'mil.txt')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(results, path.join('euiv', 'tech.json'))
}
