const { readFiles, writeFile, getModifier } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')

const results = []

const handler = data => {
  Object.keys(data).forEach(key => {
    const name = getAttribute(key)
    const modifier = data[key]
    const entity = {
      name,
      key,
      modifiers: []
    }
    Object.keys(modifier).forEach(key => {
      const attribute = modifier[key]
      if (getAttribute(key)) {
        const modifier = getModifier(key, attribute)
        if (modifier.target !== 'Text' && modifier.target !== 'General')
          entity.modifiers.push(modifier)
      }
    })
    if (entity.modifiers.length)
      results.push(entity)
  })
}

const handlers = {
  [path.join('ir', 'modifiers')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(results, path.join('ir', 'modifiers.json'))
}
