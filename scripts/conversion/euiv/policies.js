const { readFiles, writeFile, getModifier, sort } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')


const results = {}

const handler = data => {
  Object.keys(data).forEach(key => {
    const policy = data[key]
    const entity = {
      name: getAttribute(key),
      key,
      modifiers: []
    }
    Object.keys(policy).forEach(key => {
      const attribute = policy[key]
      if (getAttribute(key)) {
        const modifier = getModifier(key, attribute)
        if (modifier.attribute === 'Morale') {
          modifier.type = 'Modifier'
          modifier.noPercent = undefined
        }
        if (modifier.target !== 'Text')
          entity.modifiers.push(modifier)
      }
    })
    if (entity.modifiers.length)
      results[key] = entity
  })
}

const handlers = {
  [path.join('euiv', 'policies')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('euiv', 'policies.json'), results)
}
