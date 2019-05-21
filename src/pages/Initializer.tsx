import { Component } from 'react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyType } from '../store/units/types'
import { selectTerrain, selectTactic } from '../store/land_battle'
import { TerrainDefinition, TerrainType } from '../store/terrains'
import { TacticDefinition, TacticType } from '../store/tactics'

/**
 * Component to initialize data on start up.
 */

class Initializer extends Component<IProps> {

  constructor(props: IProps) {
    super(props)
    this.props.selectTerrain(0, this.props.terrains.get(TerrainType.None)!)
    this.props.selectTerrain(1, this.props.terrains.get(TerrainType.Plains)!)
    this.props.selectTactic(ArmyType.Attacker, this.props.tactics.get(TacticType.ShockAction)!)
    this.props.selectTactic(ArmyType.Defender, this.props.tactics.get(TacticType.ShockAction)!)
  }

  render() {
    return null
  }
}

const mapStateToProps = (state: AppState) => ({
  terrains: state.terrains.terrains,
  tactics: state.tactics.tactics
})

const mapDispatchToProps = (dispatch: any) => ({
  selectTactic: (army: ArmyType, tactic: TacticDefinition) => dispatch(selectTactic(army, tactic)),
  selectTerrain: (index: number, terrain: TerrainDefinition) => dispatch(selectTerrain(index, terrain))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Initializer)
