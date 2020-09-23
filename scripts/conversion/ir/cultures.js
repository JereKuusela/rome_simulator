const { writeFile } = require('./core')
const path = require('path')
const { getCultures } = require('./modifiers')

exports.run = () => {
  writeFile(path.join('ir', 'cultures.json'), getCultures())
}
