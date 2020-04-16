const core = require('./core')
const path = require('path')
const modifiers = require('./modifiers')


const handleTraits = (results, data) => {
  Object.keys(data).forEach(key => {
    const name = modifiers.format(key)
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
            entity.modifiers.push(core.getModifier(key, attribute[key]))
        })
        return
      }
      if (modifiers.getAttribute(key))
        entity.modifiers.push(core.getModifier(key, attribute))
    })
    results[name] = entity
  })
}

const parsers = {
  [path.join('ir', 'traits', '00_military.txt')]: handleTraits
}

exports.run = () => core.parseFiles(parsers, undefined, path.join('ir', 'traits.json'))
