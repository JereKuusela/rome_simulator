import { OrderedSet, Map, OrderedMap } from 'immutable'
import React, { Component } from 'react'
import { List } from 'semantic-ui-react'
import { UnitType, UnitDefinition } from '../store/units'
import { TacticDefinition } from '../store/tactics'
import { calculateValue, getImage } from '../base_definition'
import { CountryName } from '../store/countries'
import { renderImages } from './utils'
import StyledNumber from './StyledNumber'
import { toSignedPercent } from '../formatters'

interface IProps {
  readonly units: Map<CountryName, OrderedMap<UnitType, UnitDefinition>>
  readonly unit_types: OrderedSet<UnitType>
  readonly item: UnitDefinition | TacticDefinition
  readonly styled?: boolean
}

export default class VersusList extends Component<IProps> {

  render(): JSX.Element {
    return (
      <List horizontal>
        {
          this.props.unit_types.filter(type => calculateValue(this.props.item, type)).map(type => (
            <List.Item key={type} style={{ marginLeft: 0, marginRight: '1em' }}>
              {renderImages(this.props.units.filter(value => value.get(type)).map(value => getImage(value.get(type))).toOrderedSet())}
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
