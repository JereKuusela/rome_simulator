/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile } = require('./core')
const path = require('path')

let areas = {}
const results = {}

const areasHandler = data => {
  areas = data
}

const regionsHandler = data => {
  Object.keys(data).forEach(key => {
    const region = data[key]
    const regionAreas = []
    region.areas.forEach(key => {
      regionAreas.push(...areas[key].provinces)
    })
    results[key] = regionAreas
  })
}

const handlers = {
  [path.join('ir', 'map_data', 'areas.txt')]: areasHandler,
  [path.join('ir', 'map_data', 'regions.txt')]: regionsHandler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'regions.json'), results)
}
