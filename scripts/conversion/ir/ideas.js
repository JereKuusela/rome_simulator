/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, convertEntry } = require('./core')
const path = require('path')

const results = []
const ignoredKeys = ['trigger', 'group', 'soundeffect']

const handler = data => {
  Object.keys(data).forEach(key => {
    const idea = data[key]
    results.push(convertEntry(key, idea, idea.group, ignoredKeys))
  })
}

const handlers = {
  [path.join('ir', 'ideas', '00_ideas.txt')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'ideas.json'), results)
}
