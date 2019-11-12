import React, { Component } from 'react'
import { VictoryChart, VictoryVoronoiContainer, VictoryTheme } from 'victory'

interface IProps {
  getTooltip: (datum: Datum) => string
  onActivated: (datum: Datum[]) => void
}

export interface Datum {
  y: number
  childName: string
  x: number
}

/**
 * Base chart for a common style.
 */
export default class BaseChart extends Component<IProps> {

  render() {
    const { getTooltip, onActivated, children } = this.props
    return (
      <VictoryChart
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => getTooltip(datum)}
            onActivated={onActivated}
          />
        }
        theme={VictoryTheme.material}
        domainPadding={10}
        padding={{ top: 25, left: 50, bottom: 30, right: 50 }}
      >
        {
          children
        }
      </VictoryChart>
    )
  }
}
