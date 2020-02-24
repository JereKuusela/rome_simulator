const path = require('path');
const fs = require('fs');
const readline = require('readline');
const directoryPath = path.join(__dirname, '../../conversion');
const resultPath = path.join(__dirname, '../../src/data/json');

const format = value => {
  if (!isNaN(value))
    return Number(value);
  value = path.parse(value).name;
  let split = value.split('_');
  split = split.map(part => part[0].toUpperCase() + part.substring(1));
  return split.join(' ');
}

exports.format = format;

const parseLine = line => {
  const split = line.split('=');
  if (split.length > 1)
    return [split[0].trim(), format(split[1].trim())]
  return null
}

let results = {};

const parseFile = (file, parser) => {
  const promise = new Promise(resolve => {
    const rd = readline.createInterface({
      input: fs.createReadStream(path.join(directoryPath, file)),
      console: false
    });
    const result = {};
    rd.on('line', line => {
      const parsed = parseLine(line);
      if (parsed)
        parser(parsed[0], parsed[1], result);
    });
    rd.on('close', () => {
      results[file] = result;
      resolve();
    });
  });
  return promise;
}

const parseFiles = (parser, directory) => {
  if (path.parse(directory).ext) {
    return parseFile(directory, parser);
  }
  const promise = new Promise(resolve => {
    fs.readdir(path.join(directoryPath, directory), (err, files) => {
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      const promises = files.map(file => parseFile(path.join(directory, file), parser));
      Promise.all(promises).then(resolve);
    })
  });
  return promise;
}

exports.parseFiles = (parsers, transformer, filename) => {
  results = {};
  const promises = Object.keys(parsers).map(key => parseFiles(parsers[key], key));
  Promise.all(promises).then(() => {
    const text = JSON.stringify({
      [path.parse(filename).name]: transformer(results)
    }, undefined, 2);
    const file = path.join(resultPath, filename);
    fs.writeFile(file, text, err => {
      if (err) throw err;
      console.log(file);
    });
  }).catch(e => console.log(e));
}
