const core = require('./core')
const path = require('path')
const modifiers = require('./modifiers')


const convertValue = (key, value) => {
  switch (key) {
    case 'army':
      return value === 'yes' ? 'Land' : 'Naval'
    case 'build_cost':
      return value.gold
    case 'light_infantry':
    case 'heavy_infantry':
    case 'heavy_cavalry':
    case 'warelephant':
    case 'horse_archers':
    case 'archers':
    case 'camels':
    case 'chariots':
    case 'light_cavalry':
    case 'supply_train':
    case 'liburnian':
    case 'trireme':
    case 'liburnian':
    case 'tetrere':
    case 'hexere':
    case 'octere':
    case 'mega_galley':
    case 'morale_damage_taken':
    case 'morale_damage_done':
    case 'strength_damage_taken':
    case 'strength_damage_done':
    case 'attrition_weight':
      return Math.round(100 * (Number(value) - 1)) / 100
    case 'category':
      return core.format(value + '_ship')
    case 'is_flank':
      return value === 'Yes' ? 'Flank' : ''
    case 'support':
      return value === 'Yes' ? 'Support' : ''
    default:
      return value
  }
}

const handleUnit = (results, data) => {
  Object.keys(data).forEach(key => {
    const type = modifiers.getAttribute(key)
    const values = data[key]
    const unit = {
      'Type': type
    }
    Object.keys(values).forEach(key => {
      const value = values[key]
      if (modifiers.getAttribute(key))
        unit[modifiers.getAttribute(key)] = convertValue(key, value)
    })
    results[type] = unit
  })
}

const transformer = result => {
  Object.keys(result).forEach(key => {
    const unit = result[key]
    unit['Parent'] = unit['Parent'] || 'Land Unit'
    Object.keys(unit).forEach(key => {
      if (!unit[key])
        delete unit[key]
    })
  })
  return Object.values(result)
}

const parsers = {
  [path.join('ir', 'units')]: handleUnit
}

exports.run = () => core.parseFiles(parsers, transformer, path.join('ir', 'units.json'))
