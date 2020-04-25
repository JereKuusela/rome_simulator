const { writeFile } = require('./core')
const path = require('path')
const { getCountries } = require('./modifiers')

exports.run = () => {
  writeFile(getCountries(), path.join('ir', 'countries.json'))
}
