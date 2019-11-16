import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import { Range, getTrackBackground } from 'react-range'

import Headers from './Utils/Headers'

import { Side } from '../store/battle'
import { UnitCalc } from '../store/units'
import { toArr, keys, reduce } from '../utils'

export type WearinessValues = { [key in Side]: UnitCalcValues }
export type UnitCalcValues = { [key in UnitCalc]: MinMax }
type MinMax = { min: number, max: number }

interface IProps {
  values: WearinessValues
  onChange: (side: Side, type: UnitCalc, min: number, max: number) => void
  attached?: boolean
}
const COLORS = ['#0C2960', '#276EF1', '#9CBCF8', '#ccc'];

/**
 * Allows setting min and max value for weariness (random losses).
 */
export default class WearinessRange extends Component<IProps> {

  readonly headers = ['Weariness', 'Attacker', 'Defender']

  render() {
    const { attached, values } = this.props
    const calcs = keys(reduce(values, (prev, curr) => ({ ...prev, ...curr }), {} as UnitCalcValues))
    return (
      <Table celled unstackable attached={attached}>
        <Headers values={this.headers} />
        <Table.Body>
          {calcs.map(type => this.renderRow(type, values))}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (type: UnitCalc, values: WearinessValues) => {
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
      step={0.1}
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
            width: '100%'
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
                colors: COLORS,
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
      renderThumb={({ props, isDragged, index }) => (
        <div
          {...props}
          style={{
            ...props.style,
            height: '42px',
            width: '42px',
            borderRadius: '4px',
            backgroundColor: '#FFF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0px 2px 6px #AAA'
          }}
        >
          <div
            style={{
              height: '16px',
              width: '5px',
              backgroundColor: isDragged ? COLORS[index] : '#CCC'
            }}
          />
        </div>
      )}
    />
  )
}
