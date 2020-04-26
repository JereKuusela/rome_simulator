const { readFiles, writeFile, getModifier, sort } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')

const results = {}

const handler = data => {
  Object.keys(data).forEach(key => {
    const name = getAttribute(key)
    const heritage = data[key]
    const entity = {
      name,
      key,
      modifiers: []
    }
    Object.keys(heritage.modifier).forEach(key => {
      const attribute = heritage.modifier[key]
      if (getAttribute(key))
        entity.modifiers.push(getModifier(key, attribute))
    })
    results[key] = entity
  })
}

const handlers = {
  [path.join('ir', 'heritage')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(sort(results), path.join('ir', 'heritages.json'))
}
