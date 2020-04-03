const core = require('./core');
const path = require('path');

const convertKey = (key, value) => {
  if (value === '{')
    return 'type'
  switch (key) {
    case 'army':
      return 'mode';
    case 'camels':
      return 'camel_cavalry';
    case 'warelephant':
      return 'war_elephants';
    case 'mega_galley':
      return 'mega_polyreme';
    case 'gold':
      return 'cost';
    case 'category':
      return 'parent';
    case 'is_flank':
    case 'support':
      return 'role';
    default:
      return key;
  }
}

const validRow = key => {
  switch (key) {
    case 'build_cost':
    case 'allow':
    case 'assault':
    case 'movement_speed':
    case 'build_time':
    case 'enable':
    case 'attrition_loss':
    case 'ai_max_percentage':
    case 'outside_of_naval_range_attrition':
    case 'manpower':
    case 'trade_good_surplus':
    case 'merc_cohorts_required':
    case 'default':
    case 'setup_fraction':
      return false;
    default:
      return true;
  }
}

const convertValue = (key, value) => {
  if (value === '{')
    return core.format(convertKey(key));
  switch (key) {
    case 'army':
      return value === 'Yes' ? 'Land' : 'Naval';
    case 'light_infantry':
    case 'heavy_infantry':
    case 'heavy_cavalry':
    case 'warelephant':
    case 'horse_archers':
    case 'archers':
    case 'camels':
    case 'chariots':
    case 'light_cavalry':
    case 'supply_train':
    case 'liburnian':
    case 'trireme':
    case 'liburnian':
    case 'tetrere':
    case 'hexere':
    case 'octere':
    case 'mega_galley':
    case 'morale_damage_taken':
    case 'morale_damage_done':
    case 'strength_damage_taken':
    case 'strength_damage_done':
    case 'attrition_weight':
      return Math.round(100 * (Number(value) - 1)) / 100;
    case 'category':
      return core.format(value + '_ship');
    case 'is_flank':
      return value === 'Yes' ? 'Flank' : '';
    case 'support':
      return value === 'Yes' ? 'Support' : '';
    default:
      return value;
  }
}

const handleUnit = (key, value, result) => {
  if (validRow(key, value))
    result[convertKey(key, value)] = convertValue(key, value);
}

const transformer = result => {
  Object.keys(result).forEach(key => {
    const unit = result[key];
    unit['parent'] = unit['parent'] || 'Land Unit';
    Object.keys(unit).forEach(key => {
      if (!unit[key])
        delete unit[key];
    });
  });
  return Object.values(result);
}

const parsers = {
  [path.join('ir', 'units')]: handleUnit
};

exports.run = () => core.parseFiles(parsers, transformer, path.join('ir', 'units.json'));
