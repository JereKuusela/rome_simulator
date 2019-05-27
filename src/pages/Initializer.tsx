import { Component } from 'react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyName } from '../store/units/types'
import { selectTerrain, selectTactic } from '../store/land_battle'
import { TerrainDefinition, TerrainType } from '../store/terrains'
import { TacticDefinition, TacticType } from '../store/tactics'

/**
 * Component to initialize data on start up.
 */

class Initializer extends Component<IProps> {

  constructor(props: IProps) {
    super(props)
    this.props.selected_terrains.get(0) || this.props.selectTerrain(0, this.props.terrains.get(TerrainType.None)!)
    this.props.selected_terrains.get(1) || this.props.selectTerrain(1, this.props.terrains.get(TerrainType.Plains)!)
    this.props.attacker.tactic || this.props.selectTactic(ArmyName.Attacker, this.props.tactics.get(TacticType.ShockAction)!)
    this.props.defender.tactic || this.props.selectTactic(ArmyName.Defender, this.props.tactics.get(TacticType.ShockAction)!)
  }

  render() {
    return null
  }
}

const mapStateToProps = (state: AppState) => ({
  terrains: state.terrains.terrains,
  tactics: state.tactics.tactics,
  attacker: state.land.attacker,
  defender: state.land.defender,
  selected_terrains: state.land.terrains
})

const mapDispatchToProps = (dispatch: any) => ({
  selectTactic: (army: ArmyName, tactic: TacticDefinition) => dispatch(selectTactic(army, tactic)),
  selectTerrain: (index: number, terrain: TerrainDefinition) => dispatch(selectTerrain(index, terrain))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Initializer)
