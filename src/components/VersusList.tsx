import React, { Component } from 'react'
import { List } from 'semantic-ui-react'

import Images from './Utils/Images'
import StyledNumber from './Utils/StyledNumber'
import { UnitType, Unit, TacticDefinition } from 'types'
import { calculateValue } from 'definition_values'
import { toSignedPercent } from 'formatters'

interface IProps {
  images: { [key in UnitType]: string[] }
  unit_types: UnitType[]
  item: Unit | TacticDefinition
  styled?: boolean
}

/**
 * Shows unit's strength and weakness versus other units.
 */
export default class VersusList extends Component<IProps> {

  render() {
    const { unit_types, item, images, styled } = this.props
    return (
      <List horizontal>
        {
          unit_types.filter(type => calculateValue(item, type)).map(type => (
            <List.Item key={type} style={{ marginLeft: 0, width: '50%' }}>
              <Images values={images[type]} />
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
