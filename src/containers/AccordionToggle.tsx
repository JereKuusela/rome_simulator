import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Accordion, Icon, Header } from 'semantic-ui-react'

import { AppState } from 'state'
import { toggleAccordion } from 'reducers'

type Props = {
  title: string
  identifier: string
  open?: boolean
}

/**
 * Togglable accordion.
 */
class AccordionToggle extends Component<IProps> {

  render() {
    const { active, title, identifier, toggleAccordion, children } = this.props
    return (
      <Accordion>
        <Accordion.Title active={active} onClick={() => toggleAccordion(identifier)}>
          <Header>
            <Icon name='dropdown' />
            {title}
          </Header>
        </Accordion.Title>
        <Accordion.Content active={active}>
          {children}
        </Accordion.Content>
      </Accordion>
    )
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  active: props.open ? !state.ui.accordions[props.identifier] : state.ui.accordions[props.identifier]
})

const actions = { toggleAccordion }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }
export default connect(mapStateToProps, actions)(AccordionToggle)
