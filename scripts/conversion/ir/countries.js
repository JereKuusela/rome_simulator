/* eslint-disable @typescript-eslint/no-var-requires */
const { writeFile } = require('./core')
const path = require('path')
const { getCountries } = require('./modifiers')

exports.run = () => {
  writeFile(path.join('ir', 'countries.json'), getCountries())
}
