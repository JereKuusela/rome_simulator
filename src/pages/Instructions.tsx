import React, { Component } from 'react'
import { Container, Grid, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'

class Instrucctions extends Component<IProps> {
  render(): JSX.Element {
    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <Header>Battle page</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <p><b>Round</b>: Day of the battle. Recommended to only add units on 'Before combat' phase to get accurate deployment.</p>
              <p><b>Create units</b>: Quickly add or remove units in the reserve. Also shows some stats for all units in the army.</p>
              <p><b>Arrows</b>: Changes the day of the battle. Double arrows change 10 days. You can only move forward if both sides have units left.</p>
              <p><b>Attacker's / Defender's army</b>: Units in the battle field.</p>
              <p><b>Army dropdown</b>: Allows changing the army. Affects available units and their combat modifiers.</p>
              <p><b>General skill</b>: Martial level for the general. Affects dice roll.</p>
              <p><b>Tactic</b>: Tactic in the combat. Percentage gets affected by units in the battle field and opponent's tactic</p>
              <p><b>Dice</b>: Current dice roll.</p>
              <p><b>Randomize</b>: Whether the dice roll is randomized. Turn this off for controlled results.</p>
              <p><b>Location</b>: Terrains in the battle. Affects mainly the dice roll.</p>
              <p><b>Attacker's / Defender's reserve</b>: Units in the reserve. Units are deployed automatically. Different rules are used before the combat and during the combat.</p>
              <p><b>Preferred unit types</b>: Preferences for deployment. Front units are prioritized before combat. Back units are prioritized during combat. Flank units are prioritized for flanks.</p>
              <p><b>Flank size</b>: Minimum flank size, only works when the army has at least 32 units. Actual flank size depends on amount of enemy units.</p>
              <p><b>Attacker's / Defender's defeated units</b>: Defeated units which can no longer participate in the fight.</p>
              <br />
              <br />
              <br />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Header>Units page</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              Contains definitions of units for different armies.
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <p><b>Create new army</b>: Creates a new army with default unit definitions.</p>
              <p><b>Unit definition table</b>: Shows available units and their attributes. Row can be clicked to edit attributes.</p>
              <p><b>Global stats</b>: Unit modifiers affecting all units of the army.</p>
              <p><b>Create new unit</b>: Adds a new unit to the army with default attributes.</p>
              <p><b>Change army names</b>: Changes name of the army. Only affects UI.</p>
              <p><b>Delete army</b>: Deletes an army.</p>
              <br />
              <br />
              <br />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Header>Terrains page</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              Contains definitions for terrains. Includes both actual terrains and crossing terrains. Terrains mainly affect the dice roll of the attacker but units can also have an attack damage bonus on given terrains.
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <p><b>Terrain definitions table</b>: Terrain definitions. Click on a row to edit or remove  any terrain.</p>
              <p><b>Terrain</b>: Identifier of the terrain. Units may have attack damage bonus on certain terrains. Changing this value will break any related bonuses.</p>
              <p><b>Location</b>: Type of the terrain. Tiles are normal terrains. Borders are extra conditions, such as crossing a river doing a naval invasion.</p>
              <p><b>Roll</b>: Effect on the attacker's dice roll.</p>
              <p><b>Create new</b>: Creates a new terrain with default attributes.</p>
              <br />
              <br />
              <br />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Header>Tactics page</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              Contains definitions for tactics. Tactics affect both damage dealt and casualties. Damage effect only works when a tactic gets countered. Positive effect depends on units on the field while the negative effect is always the same.
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <p><b>Tactic definitions table</b>: Tactic definitions. Click on a row to edit or remove any tactic.</p>
              <p><b>Tactic</b>: Identifier of the tactic. Units have different effectiveness for different tactics. Changing this value will reset these.</p>
              <p><b>Unit effectiveness</b>: Lists which units benefit from the tactic. The final value is an average for all units.</p>
              <p><b>Against other tactic</b>: Countering and countered tactics. Percentages show maximum effect on the damage.</p>
              <p><b>Casualties</b>: Effect on manpower lost when this tactic selected. Affects both attacker and defender. Stacks additively if both tactics change this.</p>
              <p><b>Create new</b>: Creates a new tactic with default attributes.</p>
              <br />
              <br />
              <br />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Header>Stats page</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              Shows statistics for the current round of the battle.
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <p><b>Stats table</b>: Lists statistics for all unit types in the battle.</p>
              <p><b>Manpower</b>: Current manpower / Total manpower.</p>
              <p><b>Morale</b>: Current morale / Total morale.</p>
              <p><b>Enemies killed</b>: How many enemies these units have killed. Not 100% accurate because overkill is also counted.</p>
              <p><b>Morale depleted</b>: How much morale these units have depleted. Not 100% accurate because overdepletion is also counted.</p>
              <br />
              <br />
              <br />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Header>Transfer page</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              Allows exporting and importing data. Recommended to use JSON tools if you want to edit the data.
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <p><b>Export</b>: Exporting allows you to specify which parts of the data to export.</p>
              <p><b>Import</b>: Imports data from the text box. Recommended to be careful. Corrupted data may cause weird behavior.</p>
              <p><b>Reset missing data</b>: When turned on, export resets missing data to default values. Useful to reset all data.</p>
              <br />
              <br />
              <br />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Instrucctions)
