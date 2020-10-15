const { readFiles, writeFile, forEach, setValues, get, cleanResults } = require('./core')
const path = require('path')

const results = {}

const handler = data => {
  Object.keys(data).forEach(key => {
    if (key.startsWith('@'))
      return
    const type = get(key)
    if (!type)
      return
    const values = data[key]
    const unit = {
      'Type': type
    }
    setValues(values, unit)
    forEach(values['terrain_bonus'], (terrain, attributes) => {
      forEach(attributes, (attribute, value) => {
        [attribute, value] = get(attribute, value)
        unit[`${get(terrain)} ${attribute}`] = value
      })
    })
    setValues(values['counters'], unit)
    results[type] = unit
  })
}

const transformer = () => Object.values(cleanResults(results))

const handlers = {
  [path.join('ck3', 'regiment_types')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ck3', 'units.json'), transformer())
}
