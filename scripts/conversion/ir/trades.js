/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, getModifier, sort } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')

const results = {}

const handleTradeSub = (key, modifiers) => {
  const entity = {
    name: getAttribute(key),
    key,
    modifiers: []
  }
  Object.keys(modifiers).forEach(key => {
    const attribute = modifiers[key]
    if (getAttribute(key)) {
      const modifier = getModifier(key, attribute)
      if (modifier.target !== 'Text') entity.modifiers.push(modifier)
    }
  })
  if (entity.modifiers.length) results[key] = entity
}

const handler = data => {
  Object.keys(data).forEach(key => {
    const trade = data[key]
    handleTradeSub(key, trade.country)
  })
}

const handlers = {
  [path.join('ir', 'trade_goods', '00_default.txt')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'trades.json'), sort(results))
}
