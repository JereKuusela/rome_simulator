/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, handler1 } = require('./core')
const path = require('path')

const results = []
const modifierCallback = item => item.modifier
const parentCallback = item => item.religion_category

const handler = data => handler1(results, data, modifierCallback, parentCallback)

const handlers = {
  [path.join('ir', 'religions')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'religions.json'), results)
}
