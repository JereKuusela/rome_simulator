const core = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')

const handleTraditions = (results, data) => {
  Object.keys(data).forEach(key => {
    const tradition = data[key]
    const paths = Object.keys(tradition).filter(key => key.endsWith('_path')).map(key => {
      const path = tradition[key]
      const traditions = Object.keys(path).map(key => {
        const item = path[key]
        const modifiers = Object.keys(item).filter(getAttribute).map(key => core.getModifier(key, item[key]))
        return {
          name: getAttribute(key),
          modifiers
        }
      })
      return {
        name: getAttribute(key),
        traditions
      }
    })
    const type = getAttribute(key)
    results[type] = {
      type,
      modifiers: Object.keys(tradition.start).map(key => core.getModifier(key, tradition.start[key])),
      paths
    }
  })
}

const parsers = {
  [path.join('ir', 'military_traditions')]: handleTraditions
}

exports.run = () => core.parseFiles(parsers, undefined, path.join('ir', 'traditions.json'))
