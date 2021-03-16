/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, getModifier, sort } = require('./core')
const path = require('path')
const { getAttribute, mergeModifiers } = require('./modifiers')

const results = {}

const handleModifiers = data => {
  Object.keys(data).forEach(key => {
    const name = getAttribute(key)
    const entity = {
      name: name || key,
      key,
      modifiers: []
    }
    const modifiers = data[key]
    Object.keys(modifiers).forEach(key => {
      const attribute = modifiers[key]
      if (getAttribute(key)) {
        const modifier = getModifier(key, attribute)
        if (modifier.target !== 'Text' && modifier.target !== 'General') entity.modifiers.push(modifier)
      }
    })
    mergeModifiers(entity.modifiers)
    if (entity.modifiers.length) results[key] = entity
  })
}

const handleOffices = data => {
  Object.keys(data).forEach(key => {
    const name = getAttribute(key)
    const entity = {
      name: name || key,
      key,
      modifiers: []
    }
    const modifiers = data[key].skill_modifier
    Object.keys(modifiers).forEach(key => {
      const attribute = modifiers[key]
      if (getAttribute(key)) {
        const modifier = getModifier(key, attribute)
        if (modifier.target !== 'Text' && modifier.target !== 'General') entity.modifiers.push(modifier)
      }
    })
    if (entity.modifiers.length) results[key] = entity
  })
}
const handlers = {
  [path.join('ir', 'modifiers')]: handleModifiers,
  [path.join('ir', 'technology_tables')]: handleModifiers,
  [path.join('ir', 'offices')]: handleOffices
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'effects.json'), sort(results))
}
