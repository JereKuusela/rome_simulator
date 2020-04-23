const core = require('./core')
const { getAttribute } = require('./modifiers')
const path = require('path')

let counter = 0

const subHandle = (results, key, value, level, name) => {
  if (!results[level]) {
    results[level] = {
      name: 'Level ' + level,
      inventions: []
    }
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
  inventions[index].modifiers.push(core.getModifier(key, value))
}

const handleTech = (results, data) => {
  const tech = data.military_tech
  for (let i = 0; i <= 20; i++) {
    if (i === 0) {
      subHandle(results, '', 0, i)
      continue
    }
    if (tech.land_morale === tech.naval_morale)
      subHandle(results, 'morale', tech.land_morale, i)
    else {
      subHandle(results, 'land_morale', tech.land_morale, i)
      subHandle(results, 'naval_morale', tech.naval_morale, i)
    }
    if (tech.army_maintenance_cost === tech.navy_maintenance_cost)
      subHandle(results, 'maintenance_cost', tech.army_maintenance_cost, i)
    else {
      subHandle(results, 'army_maintenance_cost', tech.army_maintenance_cost, i)
      subHandle(results, 'navy_maintenance_cost', tech.navy_maintenance_cost, i)
    }
  }
}

const handleInvention = (results, data) => {
  Object.keys(data).forEach(name => {
    const value = data[name]
    Object.keys(value).forEach(key => {
      if (key === 'military_tech')
        return
      subHandle(results, key, value[key], value.military_tech, name)
    })
  })
}

const parsers = {
  [path.join('ir', 'technology_tables', '0_martial_table.txt')]: handleTech,
  [path.join('ir', 'inventions', '00_martial_inventions.txt')]: handleInvention
}

exports.run = () => core.parseFiles(parsers, undefined, path.join('ir', 'tech.json'))
