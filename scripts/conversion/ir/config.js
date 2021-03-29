/* eslint-disable @typescript-eslint/no-var-requires */
const { readFiles, writeFile } = require('./core')
const path = require('path')

const results = {}

const handler = data => {
  results['Land'] = {}
  results['Naval'] = {}
  results['LoyalMaintenance'] = Number(data['NCountry']['LOYAL_TROOPS_MAINTENANCE_FACTOR'])
  results['LoyalDamage'] = 0.1

  results['SoftStackWipeLimit'] = 2
  results['HardStackWipeLimit'] = 10
  results['Land']['StackWipeCaptureChance'] = 0
  results['Naval']['StackWipeCaptureChance'] = 0.2
  results['MinimumMorale'] = Number(data['NCombat']['MORALE_COLLAPSE_THRESHOLD'])
  results['MinimumStrength'] = 0
  results['ExperienceDamageReduction'] = Number(data['NCombat']['LAND_EXPERIENCE_DAMAGE_REDUCTION'])
  if (data['NCombat']['LAND_EXPERIENCE_DAMAGE_REDUCTION'] !== data['NCombat']['NAVAL_EXPERIENCE_DAMAGE_REDUCTION'])
    throw Error('Damage reduction is different per mode!')
  results['Land']['StrengthDamage'] =
    Number(data['NCombat']['LAND_STRENGTH_DAMAGE_MODIFIER']) * Number(data['NCombat']['COMBAT_DAMAGE_MULT'])
  results['Naval']['StrengthDamage'] =
    Number(data['NCombat']['NAVAL_STRENGTH_DAMAGE_MODIFIER']) * Number(data['NCombat']['COMBAT_DAMAGE_MULT'])
  results['Land']['MoraleDamage'] =
    (Number(data['NCombat']['LAND_MORALE_DAMAGE_MODIFIER']) * Number(data['NCombat']['COMBAT_DAMAGE_MULT'])) /
    Number(data['NCombat']['BASE_MORALE_DAMAGE'])
  results['Naval']['MoraleDamage'] =
    (Number(data['NCombat']['NAVAL_MORALE_DAMAGE_MODIFIER']) * Number(data['NCombat']['COMBAT_DAMAGE_MULT'])) /
    Number(data['NCombat']['BASE_MORALE_DAMAGE'])
  results['MoraleHitForLateDeployment'] = Number(data['NCombat']['MORALE_HIT_FOR_LATE_DEPLOYMENT'])
  results['MoraleHitForNonSecondaryReinforcement'] = Number(
    data['NCombat']['MORALE_HIT_FOR_NON_SECONDARY_REINFORCEMENT']
  )
  results['PhaseLength'] = Number(data['NCombat']['DAYS_PER_PHASE'])
  results['DiceMinimum'] = 1
  results['DiceMaximum'] = Number(data['NCombat']['COMBAT_DICE_SIDE'])
  results['BasePips'] = Number(data['NCombat']['COMBAT_BASE']) - 1
  results['MaxPips'] = Number(data['NCombat']['COMBAT_MAX'])
  results['CombatWidth'] = 0
  results['TacticBase'] = Number(data['NCombat']['TACTICS_START_EFFECTIVENESS'])
  results['TacticMin'] = Number(data['NCombat']['TACTICS_EFFECTIVENESS_MIN_CAP'])
  results['TacticMax'] = Number(data['NCombat']['TACTICS_EFFECTIVENESS_MAX_CAP'])

  results['CohortSize'] = Number(data['NUnit']['COHORT_SIZE'])
  results['ShipRepair'] = Number(data['NUnit']['MONTHLY_REPAIR'])
  results['RequiredCrossingSupport'] = Number(data['NUnit']['WATERCROSSING_NEGATION_REQUIRED_PER_COHORT'])
  results['LevySupportLimit'] = Number(data['NLevy']['SUPPORT_REQUIREMENT'])
  results['LevyMinimumSize'] = Number(data['NLevy']['MIN_SIZE'])
  results['LevyMaxMultiplier'] = Number(data['NLevy']['SIZE_MULTIPLIER_MAX'])
}

const handlers = {
  [path.join('ir', 'defines', '00_defines.txt')]: handler
}

exports.run = () => {
  readFiles(handlers)
  writeFile(path.join('ir', 'config.json'), results)
}
