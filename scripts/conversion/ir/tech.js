/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile, getModifiers } = require('./core')
const { getAttribute } = require('./modifiers')
const path = require('path')

const results = []

const handleTech = data => {
  const tech = data.military_tech
  for (let i = 0; i <= 20; i++) {
    if (i === 0) {
      subHandle('', 0, i)
      continue
    }
    if (tech.land_morale === tech.naval_morale) subHandle('morale', tech.land_morale, i)
    else {
      subHandle('land_morale', tech.land_morale, i)
      subHandle('naval_morale', tech.naval_morale, i)
    }
    if (tech.army_maintenance_cost === tech.navy_maintenance_cost)
      subHandle('maintenance_cost', tech.army_maintenance_cost, i)
    else {
      subHandle('army_maintenance_cost', tech.army_maintenance_cost, i)
      subHandle('navy_maintenance_cost', tech.navy_maintenance_cost, i)
    }
  }
}

const handleInvention = (name, invention) => {
  return {
    name: name ? getAttribute(name) : '',
    key: name || '',
    modifiers: getModifiers(invention.modifier)
  }
}

const handleInventions = data => {
  Object.keys(data).forEach(treeName => {
    const tree = data[treeName]
    Object.keys(tree).forEach(inventionName => {
      const invention = tree[inventionName]
      if (typeof invention === 'string') return
      results.push(handleInvention(inventionName, invention))
    })
  })
}

const handlers = {
  //[path.join('ir', 'technology_tables', '0_martial_table.txt')]: handleTech,
  [path.join('ir', 'inventions', '00_martial_inventions.txt')]: handleInventions
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'tech.json'), results)
}
