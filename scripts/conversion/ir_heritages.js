const { parseFiles, getModifier } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')


const handleHeritages = (results, data) => {
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
    results[name] = entity
  })
}

const parsers = {
  [path.join('ir', 'heritage')]: handleHeritages
}

exports.run = () => parseFiles(parsers, undefined, path.join('ir', 'heritages.json'))
