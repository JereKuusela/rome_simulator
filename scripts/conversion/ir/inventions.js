/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, convertEntry } = require('./core')
const { getAttribute } = require('./modifiers')
const path = require('path')

const results = []

const handleInventions = data => {
  Object.keys(data).forEach(treeName => {
    const tree = data[treeName]
    let technology = ''
    Object.keys(tree).forEach(inventionName => {
      const invention = tree[inventionName]
      if (inventionName === 'technology') technology = getAttribute(invention).split(' ')[0]
      if (typeof invention === 'string') return
      results.push(convertEntry(inventionName, invention.modifier, technology))
    })
  })
}

const handlers = {
  [path.join('ir', 'inventions', '00_civic_inventions.txt')]: handleInventions,
  [path.join('ir', 'inventions', '00_martial_inventions.txt')]: handleInventions,
  [path.join('ir', 'inventions', '00_oratory_inventions.txt')]: handleInventions,
  [path.join('ir', 'inventions', '00_religious_inventions.txt')]: handleInventions
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'inventions.json'), results)
}
