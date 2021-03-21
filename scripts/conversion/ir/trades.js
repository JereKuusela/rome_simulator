/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, convertEntry } = require('./core')
const path = require('path')

const results = []

const handler = data => {
  Object.keys(data).forEach(key => {
    const trade = data[key]
    results.push(convertEntry(key, [trade.province, trade.country], undefined))
  })
}

const handlers = {
  [path.join('ir', 'trade_goods', '00_default.txt')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'trades.json'), results)
}
