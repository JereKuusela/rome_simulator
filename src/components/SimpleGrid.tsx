import React, { Children, PropsWithChildren } from 'react'
import { Grid } from 'semantic-ui-react'

/**
 * Grid row that creates columns automatically.
 */
const SimpleGridRow = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <Grid.Row columns={Children.count(children) as never}>
      {Children.map(children, child => (
        <Grid.Column>{child}</Grid.Column>
      ))}
    </Grid.Row>
  )
}

export default SimpleGridRow
