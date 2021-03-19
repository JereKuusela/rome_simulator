/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, handler2 } = require('./core')
const path = require('path')

const results = []
const ignoredKeys = ['potential']

const handler = data => handler2(results, data, ignoredKeys)

const handlers = {
  [path.join('ir', 'laws')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'laws.json'), results)
}
