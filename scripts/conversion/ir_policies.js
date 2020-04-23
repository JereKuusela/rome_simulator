const { readFiles, writeFile, getModifier } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')


const results = []

const subHandler = (key, data) => {
  const entity = {
    name: getAttribute(key),
    key,
    modifiers: []
  }
  Object.keys(data).forEach(key => {
    if (getAttribute(key)) {
      const modifier = getModifier(key, data[key])
      entity.modifiers.push(modifier)
    }
  })
  return entity
}

const handler = data => {
  Object.keys(data).forEach(key => {
    if (key !== 'expense_army' && key !== 'expense_navy')
      return
    const policy = data[key]
    const entity = []
    entity.push(subHandler(key + '_low', policy.low))
    entity.push(subHandler(key + '_default', policy.default))
    entity.push(subHandler(key + '_high', policy.high))
    results.push(entity)
  })
}

const handlers = {
  [path.join('ir', 'economic_policies')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(results, path.join('ir', 'policies.json'))
}
