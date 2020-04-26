const { readFiles, writeFile, getModifier } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')


const results = {}

const handler = data => {
  Object.keys(data).forEach(key => {
    const name = getAttribute(key)
    const party = data[key]
    const entity = {
      name,
      key,
      modifiers: []
    }
    Object.keys(party.ruler_modifier).forEach(key => {
      const attribute = party.ruler_modifier[key]
      if (getAttribute(key)) {
        const modifier = getModifier(key, attribute)
        entity.modifiers.push(modifier)
      }
    })
    results[key] = entity
  })
}

const handlers = {
  [path.join('ir', 'party_types')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(results, path.join('ir', 'parties.json'))
}
