import React, { Component } from 'react'
import { List } from 'semantic-ui-react'
import { UnitType, UnitDefinition, Units } from '../store/units'
import { TacticDefinition } from '../store/tactics'
import { calculateValue, getImages } from '../base_definition'
import { renderImages } from './utils'
import StyledNumber from './StyledNumber'
import { toSignedPercent } from '../formatters'
import { toArr } from '../utils'

interface IProps {
  readonly units: Units
  readonly unit_types: Set<UnitType>
  readonly item: UnitDefinition | TacticDefinition
  readonly styled?: boolean
}

export default class VersusList extends Component<IProps> {

  render(): JSX.Element {
    return (
      <List horizontal>
        {
          Array.from(this.props.unit_types).filter(type => calculateValue(this.props.item, type)).map(type => (
            <List.Item key={type} style={{ marginLeft: 0, marginRight: '1em' }}>
              {renderImages(getImages(toArr(this.props.units), type))}
              {this.props.styled ?
                <StyledNumber
                  value={calculateValue(this.props.item, type)}
                  formatter={toSignedPercent}
                />
                : toSignedPercent(calculateValue(this.props.item, type))
              }
            </List.Item>
          ))
        }
      </List>
    )
  }
}
