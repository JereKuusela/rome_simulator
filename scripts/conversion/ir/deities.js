/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, convertEntry } = require('./core')
const path = require('path')

const results = []

const handler = data => {
  Object.keys(data).forEach(key => {
    const deity = data[key]
    const active = convertEntry(key, deity.omen, deity.deity_category, true)
    active.key = 'omen' + active.key.substr(5)
    active.name = active.name + ' Omen'
    active.isOmen = true
    const passive = convertEntry(key, deity.passive_modifier, deity.deity_category, true)
    passive.isOmen = false
    results.push(active)
    results.push(passive)
  })
}

const handlers = {
  [path.join('ir', 'deities')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'deities.json'), results)
}
