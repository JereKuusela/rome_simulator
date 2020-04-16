const core = require('./core')
const path = require('path')

const subHandle = (results, key, value, level, is_tech) => {
  if (!results[level]) {
    results[level] = {
      name: 'Level ' + level,
      inventions: []
    }
  }
  const inventions = results[level].inventions
  if (!is_tech || !inventions.length )
    inventions.push({
      name: is_tech ? '' : 'Invention ' + level + ' ' + inventions.length,
      modifiers: []
    })
  if (!key)
    return
  const index = is_tech ? 0 : inventions.length - 1
  inventions[index].modifiers.push(core.getModifier(key, value))
}

const handleTech = (results, data) => {
  const tech = data.military_tech
  for (let i = 0; i <= 20; i++) {
    if (i === 0) {
      subHandle(results, '', 0, i, true)
      continue
    }
    if (tech.land_morale === tech.naval_morale)
      subHandle(results, 'morale', tech.land_morale, i, true)
    else {
      subHandle(results, 'land_morale', tech.land_morale, i, true)
      subHandle(results, 'naval_morale', tech.naval_morale, i, true)
    }
    if (tech.army_maintenance_cost === tech.navy_maintenance_cost)
      subHandle(results, 'maintenance_cost', tech.army_maintenance_cost, i, true)
    else {
      subHandle(results, 'army_maintenance_cost', tech.army_maintenance_cost, i, true)
      subHandle(results, 'navy_maintenance_cost', tech.navy_maintenance_cost, i, true)
    }
  }
}

const handleInvention = (results, data) => {
  Object.keys(data).forEach(key => {
    const value = data[key]
    Object.keys(value).forEach(key => {
      if (key === 'military_tech')
        return
      subHandle(results, key, value[key], value.military_tech)
    })
  })
}

const parsers = {
  [path.join('ir', 'technology_tables', '0_martial_table.txt')]: handleTech,
  [path.join('ir', 'inventions', '00_martial_inventions.txt')]: handleInvention
}

exports.run = () => core.parseFiles(parsers, undefined, path.join('ir', 'tech.json'))
