const { readFiles, writeFile, getModifier } = require('./core')
const path = require('path')
const { getAttribute, format } = require('./modifiers')

const results = []

const handler = data => {
  Object.keys(data).forEach(key => {
    const tradition = data[key]
    const paths = Object.keys(tradition).filter(key => key.endsWith('_path')).map((key, pathIndex) => {
      const path = tradition[key]
      const traditions = Object.keys(path).map((key, rowIndex)  => {
        const item = path[key]
        const modifiers = Object.keys(item).filter(getAttribute).map(key => getModifier(key, item[key]))
        return {
          name: 'Tradition ' + getAttribute(key),
          key: 'tradition_path_' + pathIndex + '_' + rowIndex,
          modifiers
        }
      })
      const split = format(key).split(' ')
      return {
        name: split[split.length - 2],
        key: 'tradition_path_' + pathIndex,
        traditions
      }
    })
    const name = getAttribute(key)
    results.push({
      name: name.substr(0 , name.length - ' Traditions'.length),
      key,
      modifiers: Object.keys(tradition.start).map(key => getModifier(key, tradition.start[key])),
      paths
    })
  })
}

const handlers = {
  [path.join('ir', 'military_traditions')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'traditions.json'), results)
}
