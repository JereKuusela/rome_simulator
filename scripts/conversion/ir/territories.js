/* eslint-disable @typescript-eslint/no-var-requires */
const { writeFile } = require('./core')
const path = require('path')
const { getTerritories } = require('./modifiers')

exports.run = () => {
  writeFile(path.join('ir', 'territories.json'), getTerritories())
}
