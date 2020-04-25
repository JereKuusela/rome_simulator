const { readFiles, writeFile, getModifier } = require('./core')
const path = require('path')
const { getAttribute, format } = require('./modifiers')


const results = []

const handler = data => {
  Object.keys(data).forEach(key => {
    const deity = data[key]
    const active = {
      name: format(key.substr(6)) + ' Omen',
      key: 'omen' + key,
      modifiers: [],
      isOmen: true
    }
    const passive = {
      name: format(key.substr(6)),
      key,
      modifiers: [],
      isOmen: false
    }
    Object.keys(deity.passive_modifier).forEach(key => {
      const value = deity.passive_modifier[key]
      if (getAttribute(key)) {
        const modifier = getModifier(key, value)
        if (modifier.target !== 'Text')
          passive.modifiers.push(modifier)
      }
    })
    Object.keys(deity.omen).forEach(key => {
      const value = deity.omen[key]
      if (getAttribute(key)) {
        const modifier = getModifier(key, value)
        if (modifier.target !== 'Text')
          active.modifiers.push(modifier)
      }
    })
    if (passive.modifiers.length)
      results.push(passive)
    if (active.modifiers.length)
      results.push(active)
  })
}

const handlers = {
  [path.join('ir', 'deities')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(results, path.join('ir', 'deities.json'))
}
