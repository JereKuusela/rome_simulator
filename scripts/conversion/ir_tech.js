const { readFiles, writeFile, getModifier } = require('./core')
const { getAttribute } = require('./modifiers')
const path = require('path')

let counter = 0

const results = []

const subHandle = (key, value, level, name) => {
  if (results.length <= level) {
    results.push({
      name: 'Level ' + level,
      inventions: []
    })
  }
  const inventions = results[level].inventions
  if (name || !inventions.length )
    inventions.push({
      name: name ? getAttribute(name): '',
      key: name || '',
      index: name ? ++counter : 0,
      modifiers: []
    })
  if (!key)
    return
  const index = name ? inventions.length - 1 : 0
  inventions[index].modifiers.push(getModifier(key, value))
}

const handleTech = data => {
  const tech = data.military_tech
  for (let i = 0; i <= 20; i++) {
    if (i === 0) {
      subHandle('', 0, i)
      continue
    }
    if (tech.land_morale === tech.naval_morale)
      subHandle('morale', tech.land_morale, i)
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

const handleInvention = data => {
  Object.keys(data).forEach(name => {
    const value = data[name]
    Object.keys(value).forEach(key => {
      if (key === 'military_tech')
        return
      subHandle(key, value[key], value.military_tech, name)
    })
  })
}

const handlers = {
  [path.join('ir', 'technology_tables', '0_martial_table.txt')]: handleTech,
  [path.join('ir', 'inventions', '00_martial_inventions.txt')]: handleInvention
}

exports.run = () => {
  readFiles(handlers)
  writeFile(results, path.join('ir', 'tech.json'))
}
