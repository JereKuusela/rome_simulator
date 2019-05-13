import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal, Table, Input } from 'semantic-ui-react'
import { UnitType, UnitDefinition, UnitCalc, setAttackerBaseValue, setAttackerModifierValue } from '../store/units'
import { AppState } from '../store/'
import { setUnitModal } from '../store/layout'

interface IStateFromProps { unit: UnitDefinition | null }
interface IDispatchFromProps {
    close: () => void,
    setAttackerBaseValue: (type: UnitType, value_type: UnitType | UnitCalc, key: string, value: number) => void,
    setAttackerModifierValue: (type: UnitType, value_type: UnitType | UnitCalc, key: string, value: number) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps {}

const CUSTOM_VALUE_KEY = 'custom'

class UnitModal extends Component<IProps> {

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
        let base_value = unit.get_base_value(attribute, CUSTOM_VALUE_KEY)
        let modifier_value = unit.get_modifier_value(attribute, CUSTOM_VALUE_KEY)

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
                    <Input
                        defaultValue={base_value}
                        onChange={(_, data) => this.props.setAttackerBaseValue(unit.type, attribute, CUSTOM_VALUE_KEY, Number(data.value))}
                    />
                </Table.Cell>
                <Table.Cell>
                    <Input
                        defaultValue={modifier_value}
                        onChange={(_, data) => this.props.setAttackerModifierValue(unit.type, attribute, CUSTOM_VALUE_KEY, Number(data.value))}
                    />
                </Table.Cell>
            </Table.Row>
        )
    }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
    unit: state.layout.unit_modal
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
    close: () => dispatch(setUnitModal(null)),
    setAttackerBaseValue: (type: UnitType, value_type: UnitType | UnitCalc, key: string, value: number) => (
        !Number.isNaN(value) && dispatch(setAttackerBaseValue(type, value_type, key, value))
    ),
    setAttackerModifierValue: (type: UnitType, value_type: UnitType | UnitCalc, key: string, value: number) => (
        !Number.isNaN(value) && dispatch(setAttackerModifierValue(type, value_type, key, value))
    )
})

export default connect(mapStateToProps, mapDispatchToProps)(UnitModal)
