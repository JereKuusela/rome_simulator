/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, getModifiers, isRelevant } = require('./core')
const { getAttribute } = require('./modifiers')
const path = require('path')

const results = []

const convertEntry = (key, commanderRawModifiers, legionRawModifiers, unitRawModifiers) => {
  const commanderModifiers = getModifiers(commanderRawModifiers)
  const legionModifiers = getModifiers(legionRawModifiers)
  const unitModifiers = getModifiers(unitRawModifiers)
  const modifiers = [...commanderModifiers, ...legionModifiers, ...unitModifiers]
  return {
    name: getAttribute(key) || key,
    key,
    relevant: isRelevant(modifiers),
    modifiers: modifiers
  }
}

const handler = data => {
  Object.keys(data).forEach(key => {
    const distinction = data[key]
    results.push(convertEntry(key, distinction.commander, distinction.legion, distinction.unit))
  })
}

const handlers = {
  [path.join('ir', 'legion_distinctions')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'distinctions.json'), results)
}
