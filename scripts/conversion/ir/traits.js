/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, convertEntry } = require('./core')
const path = require('path')

const results = []
const ignoredKeys = ['type', 'opposites', 'dna_modifiers']

const handler = data => {
  Object.keys(data).forEach(key => {
    const trait = data[key]
    results.push(convertEntry(key, trait, trait.type, true, ignoredKeys))
  })
}

const handlers = {
  [path.join('ir', 'traits')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'traits.json'), results)
}
