/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, handler1 } = require('./core')
const path = require('path')

const results = []
const ignoredKeys = ['icon', 'skill']
const modifiersCallback = item => item
const officesCallback = item => [item.skill_modifier, item.personal_modifier]
const handleModifiers = data => handler1(results, data, modifiersCallback, undefined, ignoredKeys)
const handleOffices = data => handler1(results, data, officesCallback)

const handlers = {
  [path.join('ir', 'modifiers')]: handleModifiers,
  [path.join('ir', 'technology_tables')]: handleModifiers,
  [path.join('ir', 'offices')]: handleOffices
}

exports.run = () => {
  readFiles(handlers)
  const filtered = results.filter(item => item.relevant)
  writeFile(path.join('ir', 'effects.json'), filtered)
}
