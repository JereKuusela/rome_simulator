/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, getModifiers, isRelevant } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')

const results = []
const ignoredKeys = ['type', 'unit', 'opposites']

const convertEntry = (key, rawGeneralModifiers, rawUnitModifiers, parent = undefined, ignoredKeys = []) => {
  const generalModifiers = getModifiers(rawGeneralModifiers, ignoredKeys)
  const unitModifiers = getModifiers(rawUnitModifiers, ignoredKeys)
  const modifiers = [...generalModifiers, ...unitModifiers]
  return {
    name: getAttribute(key) || key,
    key,
    relevant: isRelevant(modifiers),
    modifiers,
    parent
  }
}

const handler = data => {
  Object.keys(data).forEach(key => {
    const trait = data[key]
    results.push(convertEntry(key, trait, trait.unit, trait.type, ignoredKeys))
  })
}

const handlers = {
  [path.join('ir', 'traits')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'traits.json'), results)
}
