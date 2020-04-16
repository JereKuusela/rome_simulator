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

const transformer = results => {
  Object.keys(results).forEach(key => {
    const unit = results[key]
    unit['Parent'] = unit['Parent'] || 'Land Unit'
    Object.keys(unit).forEach(key => {
      if (!unit[key])
        delete unit[key]
    })
  })
  return results
}

const parsers = {
  [path.join('ir', 'units')]: handleUnit
}

exports.run = () => core.parseFiles(parsers, transformer, path.join('ir', 'units.json'))
