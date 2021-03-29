/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile } = require('./core')
const path = require('path')

const results = {
  'Land Unit': {
    Type: 'Land Unit',
    Parent: null,
    Mode: 'Land',
    Role: 'Front',
    'Attrition Weight': 1.0,
    Damage: 1.0,
    Strength: 1.0
  },
  'Naval Unit': {
    Type: 'Naval Unit',
    Parent: null,
    Mode: 'Naval',
    Role: 'Front',
    'Attrition Weight': 1.0,
    Damage: 1.0,
    Strength: 1.0
  },
  'Light Ship': {
    Type: 'Light Ship',
    Parent: 'Naval Unit'
  },
  'Medium Ship': {
    Type: 'Medium Ship',
    Parent: 'Naval Unit'
  },
  'Heavy Ship': {
    Type: 'Heavy Ship',
    Parent: 'Naval Unit'
  }
}

const cutDecimals = (value, decimals) => Number(value.toFixed(decimals + 1).slice(0, -1))

const definesHandler = data => {
  results['Land Unit']['Maintenance'] = cutDecimals(Number(data['NCountry']['LAND_MAINTENANCE_FACTOR']) / 12.0, 5)
  results['Naval Unit']['Maintenance'] = cutDecimals(Number(data['NCountry']['NAVAL_MAINTENANCE_FACTOR']) / 12.0, 5)

  results['Light Ship']['Capture Chance'] = Number(data['NCombat']['SHIP_CAPTURE_CATEGORY_IMPACT'])
  results['Medium Ship']['Capture Chance'] = Number(data['NCombat']['SHIP_CAPTURE_CATEGORY_IMPACT']) * 2
  results['Heavy Ship']['Capture Chance'] = cutDecimals(Number(data['NCombat']['SHIP_CAPTURE_CATEGORY_IMPACT']) * 3, 1)
  results['Light Ship']['Capture Resist'] = Number(data['NCombat']['SHIP_CAPTURE_CATEGORY_IMPACT'])
  results['Medium Ship']['Capture Resist'] = Number(data['NCombat']['SHIP_CAPTURE_CATEGORY_IMPACT']) * 2
  results['Heavy Ship']['Capture Resist'] = cutDecimals(Number(data['NCombat']['SHIP_CAPTURE_CATEGORY_IMPACT']) * 3, 1)

  results['Land Unit']['Morale'] = Number(data['NUnit']['LAND_MORALE'])
  results['Naval Unit']['Morale'] = Number(data['NUnit']['NAVAL_MORALE'])
}

const modifiersHandler = data => {
  results['Light Ship']['River Damage Modifier'] = Number(
    data['base_values']['liburnian_riverine_terrain_combat_bonus']
  )
  if (
    data['base_values']['liburnian_riverine_terrain_combat_bonus'] !==
    data['base_values']['trireme_riverine_terrain_combat_bonus']
  )
    throw Error('Riverine bonus damage is different for light ships!')
  results['Naval Unit']['Capture Chance'] = cutDecimals(Number(data['base_values']['ship_capture_chance']) + 0.01, 2)
}

const handlers = {
  [path.join('ir', 'defines', '00_defines.txt')]: definesHandler,
  [path.join('ir', 'modifiers', '00_hardcoded.txt')]: modifiersHandler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'parent_units.json'), Object.values(results))
}
