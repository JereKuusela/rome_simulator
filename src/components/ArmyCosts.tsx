import React, { Component } from 'react'
import { Table, Image } from 'semantic-ui-react'
import { UnitCalc, Unit } from '../store/units'
import { calculateValueWithoutLoss, DefinitionType, strengthToValue } from '../base_definition'
import IconCost from '../images/cost.png'
import IconSupplyLimit from '../images/supply_limit.png'
import IconManpower from '../images/manpower.png'
import IconStrength from '../images/naval_combat.png'
import { FrontLine, Reserve, Defeated } from '../store/battle'


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
            this.renderRow('Strength', this.props.mode === DefinitionType.Naval ? IconStrength : IconManpower, UnitCalc.Strength, undefined)
          }
          {
            this.renderRow('Cost', IconCost, UnitCalc.Cost, undefined)
          }
          {
            this.renderRow('Maintenance', IconCost, UnitCalc.Maintenance, UnitCalc.Cost)
          }
          {
            this.renderRow('Supply', IconSupplyLimit, UnitCalc.AttritionWeight, undefined)
          }
        </Table.Body>
      </Table>
    )
  }

  calculateTotal = (attribute1: UnitCalc, attribute2: UnitCalc | undefined, frontline: FrontLine, reserve: Reserve, defeated: Reserve): number => {
    return frontline.reduce((previous, current) => previous + (current && !current.is_defeated ?  + this.reduce(current, attribute1, attribute2) : 0), 0)
      + reserve.reduce((previous, current) => previous + this.reduce(current, attribute1, attribute2), 0)
      + defeated.reduce((previous, current) => previous + this.reduce(current, attribute1, attribute2), 0)
  }

  reduce = (current: Unit, attribute1: UnitCalc, attribute2: UnitCalc | undefined) => (
    Math.floor(100 * calculateValueWithoutLoss(current, attribute1) * (attribute2 ? calculateValueWithoutLoss(current, attribute2) : 1))/ 100.0
  )

  finalize = (attribute: UnitCalc, value: number): string => {
    if (attribute === UnitCalc.Strength)
      return strengthToValue(this.props.mode, value)
    return String(+value.toFixed(2))
  }

  renderRow = (name: string, image: string, attribute1: UnitCalc, attribute2: UnitCalc | undefined): JSX.Element => (
    <Table.Row key={name}>
      <Table.Cell width='6'>
        <Image src={image} avatar />
        {name}
      </Table.Cell>
      <Table.Cell width='5'>
        {
          this.finalize(attribute1, this.calculateTotal(attribute1, attribute2, this.props.frontline_a, this.props.reserve_a, this.props.defeated_a))
        }
      </Table.Cell>
      <Table.Cell width='5'>
        {
          this.finalize(attribute1, this.calculateTotal(attribute1, attribute2, this.props.frontline_d, this.props.reserve_d, this.props.defeated_d))
        }
      </Table.Cell>
    </Table.Row>
  )
}
