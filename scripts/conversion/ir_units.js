const { readFiles, writeFile } = require('./core')
const path = require('path')
const modifiers = require('./modifiers')

const results = {}

const handler = data => {
  Object.keys(data).forEach(key => {
    const type = modifiers.getAttribute(key)
    const values = data[key]
    const unit = {
      'Type': type
    }
    Object.keys(values).forEach(key => {
      const value = values[key]
      if (modifiers.getAttribute(key, value) && modifiers.getValue(key, value))
        unit[modifiers.getAttribute(key, value)] = modifiers.getValue(key, value)
    })
    results[type] = unit
  })
}

const transformer = () => {
  Object.keys(results).forEach(key => {
    const unit = results[key]
    unit['Parent'] = unit['Parent'] || (unit['Mode'] === 'Land' ? 'Land Unit' : 'Naval Unit')
    delete unit['Mode']
    Object.keys(unit).forEach(key => {
      if (!unit[key])
        delete unit[key]
    })
  })
  return Object.values(results)
}

const handlers = {
  [path.join('ir', 'units')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(transformer(), path.join('ir', 'units.json'))
}
