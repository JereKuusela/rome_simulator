/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, getModifiers } = require('./core')
const { getAttribute } = require('./modifiers')
const path = require('path')

const results = []

const handleInvention = (name, invention) => {
  return {
    name: name ? getAttribute(name) : '',
    key: name || '',
    modifiers: getModifiers(invention.modifier)
  }
}

const handleInventions = data => {
  Object.keys(data).forEach(treeName => {
    const tree = data[treeName]
    Object.keys(tree).forEach(inventionName => {
      const invention = tree[inventionName]
      if (typeof invention === 'string') return
      results.push(handleInvention(inventionName, invention))
    })
  })
}

const handlers = {
  [path.join('ir', 'inventions', '00_martial_inventions.txt')]: handleInventions
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'inventions.json'), results)
}
