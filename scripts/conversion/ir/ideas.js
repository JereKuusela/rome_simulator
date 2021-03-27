/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, handler1 } = require('./core')
const path = require('path')

const results = []
const ignoredKeys = ['trigger', 'group', 'soundeffect']
const callback = item => item
const parentCallback = item => item.group

const handler = data => handler1(results, data, callback, parentCallback, ignoredKeys)

const handlers = {
  [path.join('ir', 'ideas', '00_ideas.txt')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'ideas.json'), results)
}
