import React, { Component } from 'react'
import { List } from 'semantic-ui-react'

import Images from './Utils/Images'
import StyledNumber from './Utils/StyledNumber'

import { UnitType, UnitDefinition, Units } from '../store/units'
import { TacticDefinition } from '../store/tactics'

import { calculateValue, getImages } from '../base_definition'
import { toSignedPercent } from '../formatters'
import { toArr } from '../utils'

interface IProps {
  units: Units
  unit_types: UnitType[]
  item: UnitDefinition | TacticDefinition
  styled?: boolean
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
              <Images values={getImages(toArr(units), type)} />
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
