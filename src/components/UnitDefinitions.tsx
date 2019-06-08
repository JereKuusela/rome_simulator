import { Map, OrderedSet } from 'immutable'
import React, { Component } from 'react'
import { Image, Table, List, Icon, Button } from 'semantic-ui-react'
import { UnitType, UnitDefinition, UnitCalc, ArmyName, ValueType, valueToString } from '../store/units'
import { TerrainType } from '../store/terrains'
import IconDiscipline from '../images/discipline.png'
import IconOffense from '../images/offense.png'
import IconDefense from '../images/defense.png'
import IconManpower from '../images/manpower.png'
import IconMorale from '../images/morale.png'
import { getImage, calculateValue, calculateBase, calculateModifier, calculateLoss, valueToNumber, valueToPercent, valueToRelativePercent, valueToRelativeZeroPercent, mergeValues } from '../base_definition'
import ValueModal from './ValueModal'
import Confirmation from './Confirmation'

interface IProps {
  readonly army: ArmyName
  readonly units: Map<UnitType, UnitDefinition>
  readonly types: OrderedSet<UnitType>
  readonly terrains: OrderedSet<TerrainType>
  readonly global_stats: UnitDefinition
  readonly onRowClick: (unit: UnitDefinition) => void
  readonly onCreateNew: (type: UnitType) => void
  readonly onChangeName: (old_name: ArmyName, new_name: ArmyName) => void
  readonly onDelete: (name: ArmyName) => void
}

interface IState {
  open_create: boolean
  open_edit: boolean
  open_confirm: boolean
}

// Display component for showing unit definitions for an army.
export default class UnitDefinitions extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { open_create: false, open_edit: false, open_confirm: false}
  }

  render() {
    return (
      <div>
        <ValueModal
          open={this.state.open_create}
          onSuccess={this.onCreate}
          onClose={this.onClose}
          message='New unit type'
          button_message='Create'
        />
        <ValueModal
          open={this.state.open_edit}
          onSuccess={this.onEdit}
          onClose={this.onClose}
          message='Edit name'
          button_message='Edit'
          initial={this.props.army}
        />
        <Confirmation
          onClose={this.onClose}
          onConfirm={this.onConfirm}
          open={this.state.open_confirm}
          message={'Are you sure you want to remove army ' + this.props.army + ' ?'}
        />
        <Table celled selectable unstackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                {this.props.army}
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Image src={IconMorale} avatar />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Image src={IconManpower} avatar />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Image src={IconDiscipline} avatar />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Image src={IconOffense} avatar />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Image src={IconDefense} avatar />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Icon name='arrows alternate horizontal' size='big' />
              </Table.HeaderCell>
              <Table.HeaderCell>
                Morale damage
              </Table.HeaderCell>
              <Table.HeaderCell>
                Strength damage
            </Table.HeaderCell>
              <Table.HeaderCell>
                Experience
            </Table.HeaderCell>
              <Table.HeaderCell>
                Units
            </Table.HeaderCell>
              <Table.HeaderCell>
                Terrain
            </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              this.renderGlobalStats(this.props.global_stats)
            }
            {
              this.props.types.map(value => this.renderRow(this.props.units.get(value)))
            }
          </Table.Body>
        </Table>
        <Button primary onClick={this.newOnClick}>
          Create new unit
        </Button>
        <Button primary onClick={this.editOnClick}>
          Change army name
        </Button>
        <Button primary onClick={this.confirmOnClick}>
          Delete army
        </Button>
      </div>
    )
  }

  newOnClick = () => this.setState({ open_create: true })

  onConfirm = () => this.props.onDelete(this.props.army)

  confirmOnClick = () => this.setState({ open_confirm: true })

  onCreate = (type: string) => this.props.onCreateNew(type as UnitType)

  onClose = () => this.setState({ open_create: false, open_edit: false })

  onEdit = (name: string) => this.props.onChangeName(this.props.army, name as ArmyName)

  editOnClick = () => this.setState({ open_edit: true })

  renderRow = (definition?: UnitDefinition) => {
    if (!definition)
      return null
    const unit = mergeValues(definition, this.props.global_stats)
    return (
      <Table.Row key={unit.type} onClick={() => this.props.onRowClick(unit)}>
        <Table.Cell singleLine>
          <Image src={getImage(unit)} avatar />
          {unit.type}</Table.Cell>
        <Table.Cell>
          {valueToNumber(unit, UnitCalc.Morale, false)}
        </Table.Cell>
        <Table.Cell>
          {valueToNumber(unit, UnitCalc.Manpower, false)}
        </Table.Cell>
        <Table.Cell>
          {valueToRelativePercent(unit, UnitCalc.Discipline, false)}
        </Table.Cell>
        <Table.Cell>
          {valueToRelativePercent(unit, UnitCalc.Offense, false)}
        </Table.Cell>
        <Table.Cell>
          {valueToRelativePercent(unit, UnitCalc.Defense, false)}
        </Table.Cell>
        <Table.Cell>
          {valueToNumber(unit, UnitCalc.Maneuver, false)}
        </Table.Cell>
        <Table.Cell>
          {valueToRelativeZeroPercent(unit, UnitCalc.MoraleDamageTaken, false)}
        </Table.Cell>
        <Table.Cell>
          {valueToRelativeZeroPercent(unit, UnitCalc.StrengthDamageTaken, false)}
        </Table.Cell>
        <Table.Cell>
          {valueToPercent(unit, UnitCalc.Experience, false)}
        </Table.Cell>
        <Table.Cell>
          <List horizontal>
            {
              this.props.types.filter(type => calculateValue(unit, type) !== 0).map(type => (
                <List.Item key={type} style={{ marginLeft: 0, marginRight: '1em' }}>
                  <Image src={getImage(this.props.units.get(type))} avatar />
                  {valueToString(unit, type)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
        <Table.Cell>
          <List>
            {
              this.props.terrains.filter(type => calculateValue(unit, type) !== 0).map(type => (
                <List.Item key={type}>
                  {type + ': ' + valueToString(unit, type)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
      </Table.Row>
    )
  }

  renderGlobalStats = (unit: UnitDefinition) => {
    return (
      <Table.Row key={unit.type} onClick={() => this.props.onRowClick(unit)}>
        <Table.Cell singleLine>
          <Image src={getImage(unit)} avatar />
          Global stats
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Morale)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Manpower)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Discipline)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Offense)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Defense)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Maneuver)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.MoraleDamageTaken)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.StrengthDamageTaken)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Experience)}
        </Table.Cell>
        <Table.Cell>
          <List horizontal>
            {
              this.props.types.filter(type => calculateValue(unit, type) !== 0).map(type => (
                <List.Item key={type} style={{ marginLeft: 0, marginRight: '1em' }}>
                  <Image src={this.props.units.get(type)} avatar />
                  {valueToString(unit, type)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
        <Table.Cell>
          <List>
            {
              this.props.terrains.filter(type => calculateValue(unit, type) !== 0.0).map(type => (
                <List.Item key={type}>
                  {type + ': ' + valueToRelativeZeroPercent(unit, type, false)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
      </Table.Row>
    )
  }

  renderAttributeList = (unit: UnitDefinition, attribute: ValueType) => {
    const base = calculateBase(unit, attribute)
    const modifier = calculateModifier(unit, attribute)
    const loss = calculateLoss(unit, attribute)
    return (
      <List>
        {
          base !== 0 &&
          <List.Item style={{ whiteSpace: 'nowrap' }}>
            {'Base: ' + base}
          </List.Item>
        }
        {
          modifier !== 1.0 &&
          <List.Item style={{ whiteSpace: 'nowrap' }}>
            {'Mod: ' + modifier}
          </List.Item>
        }
        {
          loss !== 0 &&
          <List.Item style={{ whiteSpace: 'nowrap' }}>
            {'Loss: ' + loss}
          </List.Item>
        }
      </List>
    )
  }
}
