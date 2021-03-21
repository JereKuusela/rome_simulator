/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, handler1 } = require('./core')
const path = require('path')

const results = []

const handler = data => handler1(results, data)

const handlers = {
  [path.join('ir', 'heritage')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'heritages.json'), results)
}
