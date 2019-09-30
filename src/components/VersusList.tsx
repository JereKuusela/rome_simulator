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
  readonly unit_types: UnitType[]
  readonly item: UnitDefinition | TacticDefinition
  readonly styled?: boolean
}

/**
 * Shows unit's strength and weakness versus other units.
 */
export default class VersusList extends Component<IProps> {

  render() {
    const { unit_types, item, units, styled } = this.props
    return (
      <List horizontal>
        {
          unit_types.filter(type => calculateValue(item, type)).map(type => (
            <List.Item key={type} style={{ marginLeft: 0, marginRight: '1em' }}>
              {renderImages(getImages(toArr(units), type))}
              {styled ?
                <StyledNumber
                  value={calculateValue(item, type)}
                  formatter={toSignedPercent}
                />
                : toSignedPercent(calculateValue(item, type))
              }
            </List.Item>
          ))
        }
      </List>
    )
  }
}
