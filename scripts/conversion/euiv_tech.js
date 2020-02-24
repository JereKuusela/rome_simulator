const core = require('./core');
const path = require('path');

const convertKey = key => {
  switch (key) {
    case 'infantry_fire':
    case 'infantry_shock':
    case 'cavalry_fire':
    case 'cavalry_shock':
    case 'artillery_fire':
    case 'artillery_shock':
    case 'land_morale':
      return key;
    case 'maneuver_value':
      return 'maneuver';
    case 'military_tactics':
    case 'combat_width':
      return key.replace(/_/g, ' ');
    default:
      return null;
  }
}

const getTarget = key => {
  const split = key.split('_');
  if (split.length > 1)
    return core.format(split[0]);
  return 'Global';
}

const getAttribute = key => {
  const split = key.split('_');
  if (split.length > 1)
    return core.format(split[1]);
  return core.format(split[0]);
}

const getType = key => {
  if (key === 'maneuver')
    return 'Modifier';
  return undefined;
}

const TECH_FILE = path.join('tech', 'mil.txt');
let tech_level = -1;

const handleTech = (key, value, result) => {
  if (key === 'technology') {
    tech_level++;
    result[tech_level] = {
      name: 'Level ' + tech_level,
      modifiers: []
    };
  }
  key = convertKey(key)
  if (key && tech_level > 0)
    result[tech_level].modifiers.push({
      target: getTarget(key),
      attribute: getAttribute(key),
      type: getType(key),
      value
    });
}

function transformer(result) {
  Object.keys(result).forEach(key => {
    result[key] = Object.values(result[key]);
  });
}

const parsers = {
  [TECH_FILE]: handleTech
};

exports.run = () => core.parseFiles(parsers, transformer, path.join('euiv', 'tech.json'));
