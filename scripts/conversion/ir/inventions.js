/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, getModifiers } = require('./core')
const { getAttribute } = require('./modifiers')
const path = require('path')

const results = []

const handleInvention = (tech, name, invention) => {
  const modifiers = getModifiers(invention.modifier)
  const militaryModifiers = modifiers.filter(modifier => modifier.target !== 'Text')
  return {
    name: name ? getAttribute(name) : '',
    key: name || '',
    tech,
    relevant: militaryModifiers.length > 0,
    modifiers
  }
}

const handleInventions = data => {
  Object.keys(data).forEach(treeName => {
    const tree = data[treeName]
    let technology = ''
    Object.keys(tree).forEach(inventionName => {
      const invention = tree[inventionName]
      if (inventionName === 'technology') technology = getAttribute(invention).split(' ')[0]
      if (typeof invention === 'string') return
      results.push(handleInvention(technology, inventionName, invention))
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
