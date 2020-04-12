const path = require('path')
const fs = require('fs')
const readline = require('readline')
const converter = require('./parser')
const directoryPath = path.join(__dirname, '../../conversion')
const resultPath = path.join(__dirname, '../../src/data/json')

const format = value => {
  if (!isNaN(value))
    return Number(value)
  value = path.parse(value).name
  let split = value.split('_')
  split = split.map(part => part[0].toUpperCase() + part.substring(1))
  return split.join(' ')
}

exports.parseObject = value => value.substr(1, value.length - 2).trim()

exports.format = format

let results = {}

const parseFile = (file, parser) => {
  const data = fs.readFileSync(path.join(directoryPath, file)).toString()
  parser(results, converter.parseFile(data))
}

const parseFiles = (parser, directory) => {
  if (path.parse(directory).ext)
    parseFile(directory, parser)
  else {
    const files = fs.readdirSync(path.join(directoryPath, directory))
    files.forEach(file => parseFile(path.join(directory, file), parser))
  }
}

exports.parseFiles = async (parsers, transformer, filename) => {
  results = {}
  Object.keys(parsers).map(key => parseFiles(parsers[key], key))
  const text = JSON.stringify({
    [path.parse(filename).name]: transformer(results)
  }, undefined, 2)
  const file = path.join(resultPath, filename)
  fs.writeFile(file, text, err => {
    if (err) throw err
    console.log(file)
  })
}
