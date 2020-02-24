const core = require('./core');
const path = require('path');

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

const TECH_FILE = path.join('tech', 'mil.txt');
let tech_level = -1;

const handleTech = (key, value, result) => {
  if (key === 'technology')
    tech_level++;
  else if (key === 'enable')
    result[core.format(value)] = tech_level;
}

const handleUnit = (key, value, result) => {
  result[convertKey(key)] = value;
}

function transformer(result) {
  const techLevels = result[TECH_FILE];
  Object.keys(result).forEach(key => {
    const unit = result[key];
    unit['type'] = core.format(key);
    unit['tech'] = techLevels[unit.type] || 0;
    Object.keys(unit).forEach(key => {
      if (key === 'maneuver' || !unit[key])
        delete unit[key];
    });
  });
  delete result[TECH_FILE];
}

const parsers = {
  'units': handleUnit,
  [TECH_FILE]: handleTech
};

exports.run = () => core.parseFiles(parsers, transformer, path.join('euiv', 'units.json'));
