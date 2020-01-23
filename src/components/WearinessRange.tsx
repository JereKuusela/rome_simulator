import React, { Component } from 'react'
import { Table, Header } from 'semantic-ui-react'
import { Range, getTrackBackground } from 'react-range'

import Headers from './Utils/Headers'
import { Side, WearinessValues, WearinessAttribute, WearinessAttributes } from 'types'
import { keys, reduce, toArr } from 'utils'
import { toPercent } from 'formatters'

interface IProps {
  values: WearinessValues
  onChange: (side: Side, type: WearinessAttribute, min: number, max: number) => void
  attached?: boolean
}

const NEUTRAL = '#CCC'
const ACTIVE = '#000'
const BACK = '#FFF'

/**
 * Allows setting min and max value for weariness (random losses).
 */
export default class WearinessRange extends Component<IProps> {

  readonly headers = ['Weariness', 'Attacker', 'Defender']

  render() {
    const { attached, values } = this.props
    const calcs = keys(reduce(values, (prev, curr) => ({ ...prev, ...curr }), {} as WearinessAttributes))
    return (
      <Table celled unstackable attached={attached}>
        <Headers values={this.headers} />
        <Table.Body>
          {calcs.map(type => this.renderRow(type, values))}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (type: WearinessAttribute, values: WearinessValues) => {
    const { onChange } = this.props
    return (
      <Table.Row key={type}>
        <Table.Cell width='6'>
          {type}
        </Table.Cell>
        {
          toArr(values, (ranges, side) => {
            const range = ranges[type]
            return (
              <Table.Cell width='5'>
                <Header textAlign='center' size='small' style={{margin: 0}}>
                  {toPercent(range.min, 0)} - {toPercent(range.max, 0)}
                </Header>
                {this.renderRange(range.min, range.max, (min, max) => onChange(side, type, min, max))}
              </Table.Cell>
            )
          })
        }
      </Table.Row>
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
