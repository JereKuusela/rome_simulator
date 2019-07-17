import React, { Component } from 'react'
import { List } from 'immutable'
import { Table, Image } from 'semantic-ui-react'
import { UnitCalc, Unit } from '../store/units'
import { calculateValueWithoutLoss, DefinitionType, strengthToValue } from '../base_definition'
import IconCost from '../images/cost.png'
import IconSupplyLimit from '../images/supply_limit.png'
import IconManpower from '../images/manpower.png'
import IconStrength from '../images/naval_combat.png'


interface IProps {
  mode: DefinitionType
  army_a: List<Unit | undefined>
  army_d: List<Unit | undefined>
  reserve_a: List<Unit>
  reserve_d: List<Unit>
  defeated_a: List<Unit>
  defeated_d: List<Unit>
  attached?: boolean
}

// Display component for showing and changing tactic details.
export default class ArmyCosts extends Component<IProps> {

  readonly headers = ['Costs for all units', 'Attacker', 'Defender']

  render(): JSX.Element {
    return (
      <Table celled unstackable attached={this.props.attached}>
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
            this.renderRow('Strength', this.props.mode === DefinitionType.Naval ? IconStrength : IconManpower, UnitCalc.Strength, 0)
          }
          {
            this.renderRow('Cost', IconCost, UnitCalc.Cost, 0)
          }
          {
            this.renderRow('Maintenance', IconCost, UnitCalc.Maintenance, 0)
          }
          {
            this.renderRow('Supply', IconSupplyLimit, UnitCalc.AttritionWeight, 1)
          }
        </Table.Body>
      </Table>
    )
  }

  calculateTotal = (attribute: UnitCalc, base: number, army: List<Unit | undefined>, reserve: List<Unit>, defeated: List<Unit>): number => {
    return army.reduce((previous, current) => previous + (current && !current.is_defeated ? calculateValueWithoutLoss(current, attribute) + base : 0), 0)
      + reserve.reduce((previous, current) => previous + calculateValueWithoutLoss(current, attribute) + base, 0)
      + defeated.reduce((previous, current) => previous + calculateValueWithoutLoss(current, attribute) + base, 0)
  }

  finalize = (attribute: UnitCalc, value: number): string => {
    if (attribute === UnitCalc.Strength)
      return strengthToValue(this.props.mode, value)
    return String(+value.toFixed(2))
  }

  renderRow = (name: string, image: string, attribute: UnitCalc, base: number): JSX.Element => (
    <Table.Row key={name}>
      <Table.Cell width='6'>
        <Image src={image} avatar />
        {name}
      </Table.Cell>
      <Table.Cell width='5'>
        {
          this.finalize(attribute, this.calculateTotal(attribute, base, this.props.army_a, this.props.reserve_a, this.props.defeated_a))
        }
      </Table.Cell>
      <Table.Cell width='5'>
        {
          this.finalize(attribute, this.calculateTotal(attribute, base, this.props.army_d, this.props.reserve_d, this.props.defeated_d))
        }
      </Table.Cell>
    </Table.Row>
  )
}
