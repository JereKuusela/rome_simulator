/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, getModifiers } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')

const traditionTrees = {}

const filterTraditions = tree =>
  Object.keys(tree).filter(traditionName => {
    const tradition = tree[traditionName]
    if (typeof tradition === 'string') return false
    if (traditionName === 'allow') return false
    return true
  })

const handler = data => {
  Object.keys(data).forEach(treeName => {
    const tree = data[treeName]
    const traditionNames = filterTraditions(tree)
    const traditions = traditionNames.map(traditionName => {
      const tradition = tree[traditionName]
      return {
        name: getAttribute(traditionName),
        key: traditionName,
        modifiers: getModifiers(tradition.modifier)
      }
    })
    const name = getAttribute(treeName)
    const cleanName = name.substr(0, name.length - ' Traditions'.length)
    traditionTrees[cleanName] = traditions
  })
}

const handlers = {
  [path.join('ir', 'military_traditions')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'traditions.json'), traditionTrees)
}
