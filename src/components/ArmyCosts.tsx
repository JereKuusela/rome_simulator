import React, { Component } from 'react'
import { Table, Image } from 'semantic-ui-react'

import IconCost from 'images/cost.png'
import IconSupplyLimit from 'images/supply_limit.png'
import IconManpower from 'images/manpower.png'
import IconStrength from 'images/naval_combat.png'
import IconFoodConsumption from 'images/food.png'
import IconFoodStorage from 'images/food_capacity.png'

import { DefinitionType, UnitCalc, Cohort, FrontLine, Reserve, Defeated } from 'types'
import { calculateValueWithoutLoss } from 'definition_values'
import { toNumber, strengthToValue } from 'formatters'


interface IProps {
  mode: DefinitionType
  frontline_a: FrontLine
  frontline_d: FrontLine
  reserve_a: Reserve
  reserve_d: Reserve
  defeated_a: Defeated
  defeated_d: Defeated
  attached?: boolean
}

/**
 * Shows various costs for both sides.
 */
export default class ArmyCosts extends Component<IProps> {

  readonly headers = ['Costs for all units', 'Attacker', 'Defender']

  render() {
    const { mode, attached } = this.props
    const is_naval = mode === DefinitionType.Naval
    const icon_strength = is_naval ? IconStrength : IconManpower
    return (
      <Table celled unstackable attached={attached}>
        <Table.Header>
          <Table.Row>
            {
              Array.from(this.headers).map((value) => (
                <Table.HeaderCell key={value}>
                  {value}
                </Table.HeaderCell>
              ))
            }
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            this.renderRow(is_naval ? 'Strength' : 'Manpower', icon_strength, this.manpowerFormatter)
          }
          {
            this.renderRow('Cost', IconCost, this.costFormatter)
          }
          {
            this.renderRow('Monthly Maintenance', IconCost, this.maintenanceFormatter)
          }
          {
            this.renderRow('Supply Limit', IconSupplyLimit, this.supplyFormatter)
          }
          {
            !is_naval && this.renderRow('Monthly Consumption', IconFoodConsumption, this.consumptionFormatter)
          }
          {
            !is_naval && this.renderRow('Food Storage', IconFoodStorage, this.storageFormatter)
          }
        </Table.Body>
      </Table>
    )
  }

  calculateTotal = (attribute1: UnitCalc, attribute2: UnitCalc | undefined, frontline: FrontLine, reserve: Reserve, defeated: Reserve): number => {
    return frontline.reduce((previous, current) => previous + current.reduce((previous, current) => previous + (current ?  + this.reduce(current, attribute1, attribute2) : 0), 0), 0)
      + reserve.reduce((previous, current) => previous + this.reduce(current, attribute1, attribute2), 0)
      + defeated.reduce((previous, current) => previous + this.reduce(current, attribute1, attribute2), 0)
  }

  reduce = (current: Cohort, attribute1: UnitCalc, attribute2: UnitCalc | undefined) => (
    Math.floor(100 * calculateValueWithoutLoss(current, attribute1) * (attribute2 ? calculateValueWithoutLoss(current, attribute2) : 1))/ 100.0
  )

  defaultFormatter = (attribute: UnitCalc, frontline: FrontLine, reserve: Reserve, defeated: Defeated) => (
    toNumber(this.calculateTotal(attribute, undefined, frontline, reserve, defeated))
  )

  maintenanceFormatter = (frontline: FrontLine, reserve: Reserve, defeated: Defeated) => (
    toNumber(this.calculateTotal(UnitCalc.Maintenance, UnitCalc.Cost, frontline, reserve, defeated))
  )

  costFormatter = (frontline: FrontLine, reserve: Reserve, defeated: Defeated) => this.defaultFormatter(UnitCalc.Cost, frontline, reserve, defeated)

  supplyFormatter = (frontline: FrontLine, reserve: Reserve, defeated: Defeated) => this.defaultFormatter(UnitCalc.AttritionWeight, frontline, reserve, defeated)

  consumptionFormatter = (frontline: FrontLine, reserve: Reserve, defeated: Defeated) => this.defaultFormatter(UnitCalc.FoodConsumption, frontline, reserve, defeated)

  manpowerFormatter = (frontline: FrontLine, reserve: Reserve, defeated: Defeated) => (
    strengthToValue(this.props.mode, this.calculateTotal(UnitCalc.Strength, undefined, frontline, reserve, defeated))
  )

  storageFormatter = (frontline: FrontLine, reserve: Reserve, defeated: Defeated) => {
    const storage = this.calculateTotal(UnitCalc.FoodStorage, undefined, frontline, reserve, defeated)
    const consumption = this.calculateTotal(UnitCalc.FoodConsumption, undefined, frontline, reserve, defeated) || 1.0
    return `${toNumber(storage / consumption / 12)} years (${toNumber(this.calculateTotal(UnitCalc.FoodStorage, undefined, frontline, reserve, defeated))})`
  }

  renderRow = (name: string, image: string, formatter: (frontline: FrontLine, reserve: Reserve, defeated: Defeated) => string) => (
    <Table.Row key={name}>
      <Table.Cell width='6'>
        <Image src={image} avatar />
        {name}
      </Table.Cell>
      <Table.Cell width='5'>
        {
          formatter(this.props.frontline_a, this.props.reserve_a, this.props.defeated_a)
        }
      </Table.Cell>
      <Table.Cell width='5'>
        {
          formatter(this.props.frontline_d, this.props.reserve_d, this.props.defeated_d)
        }
      </Table.Cell>
    </Table.Row>
  )
}
