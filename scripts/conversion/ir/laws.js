const { readFiles, writeFile, getModifier, sort } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')


const results = {}

const handler = data => {
  Object.keys(data).forEach(key => {
    const laws = data[key]
    Object.keys(laws).forEach(key => {
      if (key === 'potential')
        return
      const law = laws[key]
      const entity = {
        name: getAttribute(key),
        key,
        modifiers: []
      }
      Object.keys(law).forEach(key => {
        if (getAttribute(key)) {
          const modifier = getModifier(key, law[key])
          if (modifier.target !== 'Text')
            entity.modifiers.push(modifier)
        }
      })
      if (entity.modifiers.length)
        results[key] = entity
    })
  })
}

const handlers = {
  [path.join('ir', 'laws')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'laws.json'), sort(results))
}
