import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Accordion, Icon, Header } from 'semantic-ui-react'

import { AppState } from '../store/'
import { toggleAccordion } from 'reducers'

interface Props {
  readonly title: string
  readonly identifier: string
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
  active: state.settings.accordions[props.identifier]
})

const actions = { toggleAccordion }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }
export default connect(mapStateToProps, actions)(AccordionToggle)
