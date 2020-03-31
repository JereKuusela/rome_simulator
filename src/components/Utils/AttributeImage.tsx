import React, { Component } from 'react'
import { Image, Popup, Header } from 'semantic-ui-react'
import { UnitAttribute, Mode, CombatPhase, CountryAttribute, SiteSettings, isAttributeEnabled, Setting } from 'types'

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
import IconCost from 'images/cost.png'
import IconFoodConsumption from 'images/food.png'
import IconFoodStorage from 'images/food_capacity.png'
import IconSupplyLimit from 'images/supply_limit.png'

type IProps = {
  attribute: string
  settings: SiteSettings
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
    case UnitAttribute.Cost:
      return IconCost
    case UnitAttribute.FoodConsumption:
      return IconFoodConsumption
    case UnitAttribute.FoodStorage:
      return IconFoodStorage
    case UnitAttribute.AttritionWeight:
      return IconSupplyLimit
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

const getText = (attribute: string) => {
  switch (attribute) {
    case UnitAttribute.OffensiveSupport:
      return 'Backrow'
    case CountryAttribute.FlankRatio:
      return 'Cavalry ratio'
    case UnitAttribute.Experience:
      return 'Exp'
    case UnitAttribute.AttritionWeight:
      return 'Supply'
    default:
      return attribute
  }
}

const getExplanation = (attribute: string, settings: SiteSettings, mode?: Mode) => {
  if (!isAttributeEnabled(attribute, settings))
    return 'This attribute is currently disabled'
  switch (attribute) {
    case UnitAttribute.AttritionWeight:
      return 'Required supply'
    case UnitAttribute.CombatAbility:
      return 'Increases damage done'
    case UnitAttribute.Morale:
    case UnitAttribute.Strength:
    case CombatPhase.Fire:
    case CombatPhase.Shock:
      return attribute
    case UnitAttribute.Discipline:
      return settings[Setting.DisciplineDamageReduction] ? 'Increases damage done and reduces damage taken' : 'Increases damage'
    default:
      return null
  }
}

/**
 * Helper component for showing images of atributes.
 */
export default class AttributeImage extends Component<IProps> {

  render() {
    const { attribute, settings, mode } = this.props
    const first = getFirstImage(attribute, mode)
    const second = getSecondImage(attribute, mode)
    const explanation = getExplanation(attribute, settings, mode)
    if (explanation) {
      return (
        <>
          <Popup
            trigger={
              <div>
                {first && <Image src={first} avatar />}
                {second && <Image src={second} avatar />}
                {!first && !second && getText(attribute)}
              </ div>
            }
            content={this.getContent()}
            basic
            wide
          />
        </>
      )
    }
    return (
      <div>
        {first && <Image src={first} avatar />}
        {second && <Image src={second} avatar />}
        {!first && !second && getText(attribute)}
      </ div>
    )

  }

  getContent = () => {
    const { attribute, settings, mode } = this.props
    const explanation = getExplanation(attribute, settings, mode)
    if (attribute === explanation) {
      return (
        <span>
          <Header sub style={{ margin: 0 }}>{getText(attribute)}</Header>
        </span>
      )
    }
    return (
      <span>
        <Header sub>{getText(attribute)}</Header>
        {explanation}
      </span>
    )
  }

}
