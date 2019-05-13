import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal, Table, Input } from 'semantic-ui-react'
import { UnitDefinition, UnitCalc } from '../store/units/types'
import { AppState } from '../store/'
import { setUnitModal } from '../store/layout'

interface UnitModalProps { unit: UnitDefinition | null }

class UnitModal extends Component<UnitModalProps, {}> {

    handleClose = () => (this.props as any).close()

    render() {
        if (this.props.unit === null)
            return null
        let unit = this.props.unit
        const attributes = Object.keys(UnitCalc).map(k => UnitCalc[k as any]) as UnitCalc[]
        return (
            <Modal
                open={this.props.unit !== null}
                onClose={this.handleClose}
                basic
            >
                <Modal.Content>
                    <Table celled selectable>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    Attribute
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    Value
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    Explained
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    Custom base
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    Custom modifier
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {
                                Array.from(attributes).map((value) => {
                                    return this.renderRow(unit, value)
                                })
                            }
                        </Table.Body>
                    </Table>
                </Modal.Content>
            </Modal>
        )
    }

    renderRow = (unit: UnitDefinition, attribute: UnitCalc) => {
        return (
            <Table.Row key={attribute}>
                <Table.Cell>
                    {attribute}
                </Table.Cell>
                <Table.Cell>
                    {unit.calculate(attribute)}
                </Table.Cell>
                <Table.Cell>
                    {unit.explain(attribute)}
                </Table.Cell>
                <Table.Cell>
                    <Input />
                </Table.Cell>
                <Table.Cell>
                    {attribute}
                </Table.Cell>
            </Table.Row>
        )
    }
}


const mapStateToProps = (state: AppState): UnitModalProps => ({
    unit: state.layout.unit_modal
})

const mapDispatchToProps = (dispatch: any) => ({
    close: () => dispatch(setUnitModal(null))
})

export default connect(mapStateToProps, mapDispatchToProps)(UnitModal)
