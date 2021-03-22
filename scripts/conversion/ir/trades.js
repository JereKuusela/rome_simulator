/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, handler1 } = require('./core')
const path = require('path')

const results = []
const callback = item => [item.province, item.country]

const handler = data => handler1(results, data, callback)

const handlers = {
  [path.join('ir', 'trade_goods')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'trades.json'), results)
}
