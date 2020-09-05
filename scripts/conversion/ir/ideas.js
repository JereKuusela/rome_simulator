const { readFiles, writeFile, getModifier } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')


const results = {}

const handler = data => {
  Object.keys(data).forEach(key => {
    const name = getAttribute(key)
    const idea = data[key]
    if (idea.group !== 'military_ideas')
      return
    const entity = {
      name,
      key,
      modifiers: []
    }
    Object.keys(idea).forEach(key => {
      const attribute = idea[key]
      if (key === 'trigger' || key === 'group' || key === 'soundeffect')
        return
      if (getAttribute(key)) {
        const modifier = getModifier(key, attribute)
        entity.modifiers.push(modifier)
      }
    })
    results[key] = entity
  })
}

const handlers = {
  [path.join('ir', 'ideas', '00_ideas.txt')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'ideas.json'), results)
}
