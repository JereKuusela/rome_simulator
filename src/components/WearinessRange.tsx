import React, { Component } from 'react'
import { Table, Header } from 'semantic-ui-react'
import { Range, getTrackBackground } from 'react-range'

import Headers from './Utils/Headers'
import { WearinessAttribute, WearinessAttributes, UnitAttribute } from 'types'
import { toPercent } from 'formatters'

type IProps = {
  values: WearinessAttributes
  onChange: (type: WearinessAttribute, min: number, max: number) => void
}

const NEUTRAL = '#CCC'
const ACTIVE = '#000'
const BACK = '#FFF'

/**
 * Allows setting min and max value for weariness (random losses).
 */
export default class WearinessRange extends Component<IProps> {
  readonly headers = ['', 'Morale', 'Strength']

  render() {
    const { values } = this.props
    return (
      <Table celled unstackable>
        <Headers values={this.headers} />
        <Table.Body>
          <Table.Row>
            <Table.Cell width='6'>Weariness</Table.Cell>
            {this.renderCell(UnitAttribute.Morale, values[UnitAttribute.Morale])}
            {this.renderCell(UnitAttribute.Strength, values[UnitAttribute.Strength])}
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  renderCell = (type: WearinessAttribute, range: { min: number; max: number }) => {
    const { onChange } = this.props
    return (
      <Table.Cell width='5'>
        <Header textAlign='center' size='small' style={{ margin: 0 }}>
          {toPercent(range.min, 0)} - {toPercent(range.max, 0)}
        </Header>
        {this.renderRange(range.min, range.max, (min, max) => onChange(type, min, max))}
      </Table.Cell>
    )
  }

  renderRange = (min: number, max: number, onChange: (min: number, max: number) => void) => (
    <Range
      values={[min, max]}
      step={0.05}
      min={0}
      max={1}
      onChange={values => onChange(values[0], values[1])}
      renderTrack={({ props, children }) => (
        <div
          onMouseDown={props.onMouseDown}
          onTouchStart={props.onTouchStart}
          style={{
            ...props.style,
            height: '36px',
            display: 'flex',
            paddingRight: '5%',
            paddingLeft: '5%'
          }}
        >
          <div
            ref={props.ref}
            style={{
              height: '5px',
              width: '100%',
              borderRadius: '4px',
              background: getTrackBackground({
                values: [min, max],
                colors: [NEUTRAL, ACTIVE, NEUTRAL],
                min: 0,
                max: 1
              }),
              alignSelf: 'center'
            }}
          >
            {children}
          </div>
        </div>
      )}
      renderThumb={({ props, isDragged }) => (
        <div
          {...props}
          style={{
            ...props.style,
            height: '30px',
            width: '30px',
            borderRadius: '4px',
            backgroundColor: BACK,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0px 2px 6px #AAA'
          }}
        >
          <div
            style={{
              height: '12px',
              width: '5px',
              backgroundColor: isDragged ? ACTIVE : NEUTRAL
            }}
          />
        </div>
      )}
    />
  )
}
