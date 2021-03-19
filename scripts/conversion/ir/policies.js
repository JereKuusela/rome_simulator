/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, convertEntry } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')

const results = []

const handler = data => {
  Object.keys(data).forEach(key => {
    const policy = data[key]
    const parent = getAttribute(key) || key
    convertEntry(key + '_low', policy.low, parent)
    results.push(convertEntry(key + '_low', policy.low, parent))
    results.push(convertEntry(key + '_default', policy.default, parent))
    results.push(convertEntry(key + '_high', policy.high, parent))
  })
}

const handlers = {
  [path.join('ir', 'economic_policies')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'policies.json'), results)
}
