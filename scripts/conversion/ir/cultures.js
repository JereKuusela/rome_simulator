/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile } = require('./core')
const path = require('path')
const { getCultures } = require('./modifiers')

const templates = {}
const results = {}

const order = [
  'light_infantry',
  'archers',
  'light_cavalry',
  'horse_archers',
  'chariots',
  'camels',
  'heavy_infantry',
  'heavy_cavalry',
  'warelephant'
]

const keySorter = (a, b) => order.indexOf(a) - order.indexOf(b)

const handleTemplates = data => {
  Object.keys(data).forEach(key => {
    const entry = data[key]
    const template = {}
    Object.keys(entry)
      .sort(keySorter)
      .forEach(key => {
        if (key === 'default') return
        template[key] = entry[key]
      })
    templates[key] = template
  })
}

const handleCultures = data => {
  const names = getCultures()
  Object.keys(data).forEach(key => {
    const entry = data[key]
    if (!entry.culture) return
    const defaultTemplate = entry.levy_template || 'default'
    Object.keys(entry.culture).forEach(key => {
      results[key] = {
        name: names[key] || key,
        template: templates[entry.culture[key].levy_template || defaultTemplate],
        primary: entry.primary,
        secondary: entry.second,
        flank: entry.flank
      }
    })
  })
}

const handlers = {
  [path.join('ir', 'levy_templates')]: handleTemplates,
  [path.join('ir', 'cultures')]: handleCultures
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'cultures.json'), results, true)
}
