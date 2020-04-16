const { parseFiles, getModifier } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')


const handleTraits = (results, data) => {
  Object.keys(data).forEach(key => {
    const name = getAttribute(key)
    const trait = data[key]
    const entity = {
      name,
      modifiers: []
    }
    Object.keys(trait).forEach(key => {
      const attribute = trait[key]
      if (key === 'type')
        return
      if (key === 'unit') {
        Object.keys(attribute).forEach(key => {
          entity.modifiers.push(getModifier(key, attribute[key]))
        })
        return
      }
      if (getAttribute(key))
        entity.modifiers.push(getModifier(key, attribute))
    })
    results[name] = entity
  })
}

const parsers = {
  [path.join('ir', 'traits', '00_military.txt')]: handleTraits
}

exports.run = () => parseFiles(parsers, undefined, path.join('ir', 'traits.json'))
