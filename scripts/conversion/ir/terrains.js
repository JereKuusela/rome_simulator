/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile } = require('./core')
const path = require('path')
const { getAttribute } = require('./modifiers')

const results = [
  {
    type: 'Crossing river',
    location: 'Border',
    roll: -1,
    combat_width: 0
  },
  {
    type: 'Crossing strait',
    location: 'Border',
    roll: -2,
    combat_width: 0
  },
  {
    type: 'None',
    location: 'Border',
    roll: 0,
    combat_width: 0
  },
  {
    type: 'Duel',
    location: 'Tile',
    roll: 0,
    combat_width: 1
  }
]

const handler = data => {
  Object.keys(data).forEach(terrainName => {
    const terrain = data[terrainName]
    const name = getAttribute(terrainName)
    const entity = {
      type: name || terrainName,
      roll: terrain.defender ? -terrain.defender : 0,
      location: 'Tile',
      combat_width: terrain.combat_width || 0
    }
    results.push(entity)
  })
}

const handlers = {
  [path.join('ir', 'terrain_types')]: handler
}

exports.run = () => {
  readFiles(handlers)
  results.sort((a, b) => a.type.localeCompare(b.type))
  writeFile(path.join('ir', 'terrains.json'), results)
}
