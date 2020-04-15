const core = require('./core')
const path = require('path')
const modifiers = require('./modifiers')

const handleTraditions = (results, data) => {
  Object.keys(data).forEach(key => {
    const type = modifiers.format(key).split(' ')[0]
    const traditions = data[key]
    const tradition = {
      type,
      modifiers: Object.values(traditions.start).map(key => modifiers.getValue(key, traditions.start[key]))
    }
    Object.keys(traditions).forEach(key => {
      const value = traditions[key]
      if (modifiers.getAttribute(key))
        tradition[modifiers.getAttribute(key)] = modifiers.getValue(key, value)
    })
    results[type] = tradition
  })
}

const transformer = result => {
  Object.keys(result).forEach(key => {
    const unit = result[key]
    unit['Parent'] = unit['Parent'] || 'Land Unit'
    Object.keys(unit).forEach(key => {
      if (!unit[key])
        delete unit[key]
    })
  })
  return Object.values(result)
}

const parsers = {
  [path.join('ir', 'military_traditions')]: handleTraditions
}

exports.run = () => core.parseFiles(parsers, transformer, path.join('ir', 'units.json'))
