/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const fs = require('fs')
const converter = require('./parser')

const parseFile = (directoryPath, file, parser) => {
  const data = fs.readFileSync(path.join(directoryPath, file)).toString()
  parser(converter.parseFile(data), file)
}

const parseFiles = (directoryPath, parser, directory) => {
  if (path.parse(directory).ext) parseFile(directoryPath, directory, parser)
  else {
    const files = fs.readdirSync(path.join(directoryPath, directory))
    files.forEach(file => parseFile(directoryPath, path.join(directory, file), parser))
  }
}

exports.readFiles = (directoryPath, handlers) => {
  Object.keys(handlers).map(key => parseFiles(directoryPath, handlers[key], key))
}

exports.sort = results => {
  if (Array.isArray(results)) return results
  const sorted = {}
  Object.keys(results)
    .sort((a, b) => results[a].name.localeCompare(results[b].name))
    .forEach(key => (sorted[key] = results[key]))
  return sorted
}

exports.writeFile = (file, results) => {
  const text = JSON.stringify(results, undefined, 2)
  fs.writeFile(file, text, err => {
    if (err) throw err
    console.log(file)
  })
}
