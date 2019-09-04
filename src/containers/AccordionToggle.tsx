import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Accordion, Icon, Header } from 'semantic-ui-react'
import { AppState } from '../store/'
import { toggleAccordion } from '../store/settings'
import { has } from '../utils'

class AccordionToggle extends Component<IProps> {

  render(): JSX.Element {
    return (
      <Accordion>
        <Accordion.Title active={has(this.props.accordions, this.props.identifier)} onClick={() => this.props.toggleAccordion(this.props.identifier)}>
          <Header>
            <Icon name='dropdown' />
            {this.props.title}
          </Header>
        </Accordion.Title>
        <Accordion.Content active={has(this.props.accordions, this.props.identifier)}>
          {
            this.props.children
          }
        </Accordion.Content>
      </Accordion>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  accordions: state.settings.accordions
})

const mapDispatchToProps = (dispatch: any) => ({
  toggleAccordion: (key: string) => dispatch(toggleAccordion(key))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  readonly title: string
  readonly identifier: string
}

export default connect(mapStateToProps, mapDispatchToProps)(AccordionToggle)
