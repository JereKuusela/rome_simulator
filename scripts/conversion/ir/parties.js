/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, handler1 } = require('./core')
const path = require('path')

const results = []
const callback = item => item.ruler_modifier
const handler = data => handler1(results, data, callback)

const handlers = {
  [path.join('ir', 'party_types')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'parties.json'), results)
}
