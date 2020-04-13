const core = require('./core')
const path = require('path')
const modifiers = require('./modifiers')

const handleUnit = (results, data) => {
  Object.keys(data).forEach(key => {
    const type = modifiers.getAttribute(key)
    const values = data[key]
    const unit = {
      'Type': type
    }
    Object.keys(values).forEach(key => {
      const value = values[key]
      if (modifiers.getAttribute(key))
        unit[modifiers.getAttribute(key)] = modifiers.getValue(key, value)
    })
    results[type] = unit
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
  [path.join('ir', 'units')]: handleUnit
}

exports.run = () => core.parseFiles(parsers, transformer, path.join('ir', 'units.json'))
