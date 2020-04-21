const { parseFiles, getModifier } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')


const handleTraits = (results, data) => {
  Object.keys(data).forEach(key => {
    const name = getAttribute(key)
    const trait = data[key]
    const entity = {
      name,
      key,
      modifiers: []
    }
    Object.keys(trait).forEach(key => {
      const attribute = trait[key]
      if (key === 'type')
        return
      if (key === 'unit') {
        Object.keys(attribute).forEach(key => {
          const modifier = getModifier(key, attribute[key])
          if (modifier.target !== 'Text')
            entity.modifiers.push(modifier)
        })
        return
      }
      if (getAttribute(key)) {
        const modifier = getModifier(key, attribute)
        if (modifier.target !== 'Text')
          entity.modifiers.push(modifier)

      }
    })
    results[name] = entity
  })
}

const parsers = {
  [path.join('ir', 'traits')]: handleTraits
}

exports.run = () => parseFiles(parsers, undefined, path.join('ir', 'traits.json'))
