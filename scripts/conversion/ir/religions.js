const { readFiles, writeFile, getModifier, sort } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')


const results = {}

const handler = data => {
  Object.keys(data).forEach(key => {
    const religion = data[key]
    const entity = {
      name: getAttribute(key),
      key,
      modifiers: []
    }
    Object.keys(religion).forEach(key => {
      const attribute = religion[key]
      if (key === 'color' || key === 'religion_category' || key === 'sacrifice_icon' || key === 'sacrifice_sound')
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
  [path.join('ir', 'religions')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'religions.json'), sort(results))
}
