/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, getModifier, sort } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')

const results = {}

const handler = data => {
  Object.keys(data).forEach(key => {
    const deity = data[key]
    const active = {
      name: getAttribute(key) + ' Omen',
      key: 'omen' + key.substr(5),
      modifiers: [],
      isOmen: true
    }
    const passive = {
      name: getAttribute(key),
      key,
      modifiers: [],
      isOmen: false
    }
    Object.keys(deity.passive_modifier).forEach(key => {
      const value = deity.passive_modifier[key]
      if (getAttribute(key)) {
        const modifier = getModifier(key, value)
        if (modifier.target !== 'Text') passive.modifiers.push(modifier)
      }
    })
    Object.keys(deity.omen).forEach(key => {
      const value = deity.omen[key]
      if (getAttribute(key)) {
        const modifier = getModifier(key, value)
        if (modifier.target !== 'Text') active.modifiers.push(modifier)
      }
    })
    if (passive.modifiers.length) results[passive.key] = passive
    if (active.modifiers.length) results[active.key] = active
  })
}

const handlers = {
  [path.join('ir', 'deities')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'deities.json'), sort(results))
}
