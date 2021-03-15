const { readFiles, writeFile, getModifier, sort } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')

const results = {}

const handler = data => {
  Object.keys(data).forEach(key => {
    if (
      key === 'army_leader_less' ||
      key === 'navy_leader_less' ||
      key === 'base_values' ||
      key === 'military_experience' ||
      key === 'religious_unity'
    )
      return
    const name = getAttribute(key)
    const modifier = data[key]
    const entity = {
      name: name || key,
      key,
      modifiers: []
    }
    Object.keys(modifier).forEach(key => {
      const attribute = modifier[key]
      if (getAttribute(key)) {
        const modifier = getModifier(key, attribute)
        if (modifier.target !== 'Text' && modifier.target !== 'General') entity.modifiers.push(modifier)
      }
    })
    if (entity.modifiers.length) results[key] = entity
  })
}

const handlers = {
  [path.join('ir', 'modifiers')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'modifiers.json'), sort(results))
}
