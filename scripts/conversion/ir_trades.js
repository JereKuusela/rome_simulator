const { readFiles, writeFile, getModifier, sort } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')


const results = {}
let counter = 0

const handleTradeSub = (type, key, modifiers) => {
  const entity = {
    name: type + ': ' + getAttribute(key),
    key: type.toLowerCase() + '_' + key,
    index: type === 'Export' ? counter++ : 0,
    modifiers: []
  }
  Object.keys(modifiers).forEach(key => {
    const attribute = modifiers[key]
    if (getAttribute(key)) {
      const modifier = getModifier(key, attribute)
      if (modifier.target !== 'Text')
        entity.modifiers.push(modifier)
    }
  })
  if (entity.modifiers.length)
    results[type.toLowerCase() + '_' + key] = entity
}

const handler = data => {
  Object.keys(data).forEach(key => {
    const trade = data[key]
    handleTradeSub('Surplus', key, trade.country)
    handleTradeSub('Export', key, trade.export)
  })
}

const handlers = {
  [path.join('ir', 'trade_goods', '00_default.txt')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(sort(results), path.join('ir', 'trades.json'))
}
