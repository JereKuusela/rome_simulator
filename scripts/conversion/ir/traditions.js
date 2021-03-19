/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, handler2 } = require('./core')
const path = require('path')

const results = []
const ignoredKeys = ['color', 'image', 'allow']

const handler = data => {
  handler2(results, data, ignoredKeys, true)
}

const handlers = {
  [path.join('ir', 'military_traditions')]: handler
}

exports.run = () => {
  readFiles(handlers)
  // Clean up the excessive "Traditions" suffix from the tree names.
  const cleaned = results.map(tree => ({
    ...tree,
    parent: tree.parent.substr(0, tree.parent.length - ' Traditions'.length)
  }))
  writeFile(path.join('ir', 'traditions.json'), cleaned)
}
