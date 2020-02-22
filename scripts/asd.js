//requiring path and fs modules
const path = require('path');
const fs = require('fs');
const readline = require('readline');
//joining path of directory 
const directoryPath = path.join(__dirname, '../conversion');
const units = {};

function transform(value) {
  if (isNaN(value))
    return '"' + convertName(value) + '"';
  return Number(value);
}

function convertKey(key) {
  switch (key) {
    case 'unit_type':
      return 'culture';
    case 'type':
      return 'base';
    default:
      return key;
  }
}

function convertName(name) {
  name = path.parse(name).name;
  let split = name.split('_');
  split = split.map(part => part[0].toUpperCase() + part.substring(1));
  return split.join(' ');
}

function parseLine(line) {
  const split = line.split('=');
  if (split.length > 1)
    return [split[0].trim(), split[1].trim()]
  return null
}

const techLevels = {};
let tech_level = -1;

function handleTech(rd, resolve) {
  rd.on('line', line => {
    const parsed = parseLine(line);
    if (parsed) {
      if (parsed[0] === 'technology')
        tech_level++;
      else if (parsed[0] === 'enable')
        techLevels[convertName(parsed[1])] = tech_level;
    }
  });
  rd.on('close', () => {
    resolve();
  });
}

function handleUnit(rd, file, resolve) {
  const unit = { 'type': convertName(file) };
  rd.on('line', line => {
    const parsed = parseLine(line);
    if (parsed)
      unit[convertKey(parsed[0])] = parsed[1];
  });
  rd.on('close', () => {
    units[file] = unit;
    resolve();
  });
}

//passsing directoryPath and callback function
fs.readdir(directoryPath, (err, files) => {
  //handling error
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }
  const promises = [];
  //listing all files using forEach
  files.forEach(file => {
    const promise = new Promise(resolve => {
      const rd = readline.createInterface({
        input: fs.createReadStream(path.join(directoryPath, file)),
        console: false
      });
      if (file === 'mil.txt')
        handleTech(rd, resolve);
      else
        handleUnit(rd, file, resolve);
    });
    promises.push(promise);
  });
  Promise.all(promises).then(() => {
    const result = ['{', '\t"units": ['];
    const units_results = [];
    Object.keys(units).forEach(key => {
      const unit = units[key];
      unit['tech'] = techLevels[unit.type] || 0;
      const unit_result = [];
      Object.keys(unit).forEach(key => {
        if (key === 'maneuver' || !transform(unit[key]))
          return;
        unit_result.push('"' + key + '": ' + transform(unit[key]));
      });
      units_results.push('\t\t{\r\n\t\t\t' + unit_result.join(',\r\n\t\t\t') + '\r\n\t\t}');
    });
    result.push(units_results.join(',\r\n'));
    result.push('\t]');
    result.push('}');
    fs.writeFile('test.json', result.join('\r\n'), err => {
      if (err) throw err;
      console.log('Saved!');
    });
  }).catch(e => console.log(e));
});
