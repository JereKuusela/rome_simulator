import React, { Component } from 'react'
import { Image } from 'semantic-ui-react'
import { UnitAttribute, Mode, CombatPhase } from 'types'

import IconDiscipline from 'images/discipline.png'
import IconOffense from 'images/offense.png'
import IconDefense from 'images/defense.png'
import IconManpower from 'images/manpower.png'
import IconStrength from 'images/naval_combat.png'
import IconMorale from 'images/morale.png'
import IconAttrition from 'images/attrition.png'
import IconFire from 'images/fire.png'
import IconShock from 'images/shock.png'
import IconCombatAbility from 'images/combat_ability.png'

type IProps = {
  attribute: string
  mode?: Mode
}

const getFirstImage = (attribute: string, mode?: Mode) => {
  switch (attribute) {
    case UnitAttribute.Morale:
      return IconMorale
    case UnitAttribute.Strength:
      return mode === Mode.Naval ? IconStrength : IconManpower
    case UnitAttribute.Discipline:
      return IconDiscipline
    case UnitAttribute.Offense:
    case UnitAttribute.DamageDone:
    case UnitAttribute.MoraleDamageDone:
    case UnitAttribute.StrengthDamageDone:
    case UnitAttribute.FireDamageDone:
    case UnitAttribute.ShockDamageDone:
      return IconOffense
    case UnitAttribute.Defense:
      return IconDefense
    case UnitAttribute.DamageTaken:
    case UnitAttribute.MoraleDamageTaken:
    case UnitAttribute.StrengthDamageTaken:
    case UnitAttribute.ShockDamageTaken:
    case UnitAttribute.FireDamageTaken:
      return IconAttrition
    case UnitAttribute.CombatAbility:
      return IconCombatAbility
    case CombatPhase.Fire:
      return IconFire
    case CombatPhase.Shock:
      return IconShock
    default:
      return null
  }
}

const getSecondImage = (attribute: string, mode?: Mode) => {
  switch (attribute) {
    case UnitAttribute.MoraleDamageDone:
    case UnitAttribute.MoraleDamageTaken:
      return IconMorale
    case UnitAttribute.StrengthDamageDone:
    case UnitAttribute.StrengthDamageTaken:
      return mode === Mode.Naval ? IconStrength : IconManpower
    case UnitAttribute.ShockDamageDone:
    case UnitAttribute.ShockDamageTaken:
      return IconShock
    case UnitAttribute.FireDamageDone:
    case UnitAttribute.FireDamageTaken:
      return IconFire
    default:
      return null
  }
}

/**
 * Helper component for showing images of atributes.
 */
export default class AttributeImage extends Component<IProps> {

  render() {
    const { attribute } = this.props
    const first = getFirstImage(attribute)
    const second = getSecondImage(attribute)
    return (
      <>
        {first && <Image src={first} avatar />}
        {second && <Image src={second} avatar />}
        {!first && !second && attribute}
      </>
    )
  }
}
