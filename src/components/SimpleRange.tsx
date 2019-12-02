import React, { Component } from 'react'
import { Range, getTrackBackground } from 'react-range'

interface Props {
  onChange: (value: number) => void
  value: number
  min: number
  max: number
  step: number
}

const NEUTRAL = '#CCC'
const ACTIVE = '#000'
const BACK = '#FFF'

/**
 * Simple range to select a value.
 */
export default class SimpleRange extends Component<Props> {

  render() {
    const { onChange, value, min, max, step } = this.props
    return (
      <Range
        values={[value]}
        step={step}
        min={min}
        max={max}
        onChange={values => onChange(values[0])}
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
                  values: [value],
                  colors: [NEUTRAL, NEUTRAL],
                  min: min,
                  max: max
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
}
