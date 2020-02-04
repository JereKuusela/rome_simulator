
import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { forEach} from 'lodash'
import { Mode, TerrainType, CountryName, Side, ModeState } from 'types'
import { toArr, arrGet, keys } from 'utils'
import { getDefaultBattle } from 'data'

class BattleReducer extends ImmerReducer<ModeState> {

  selectTerrain(mode: Mode, index: number, terrain: TerrainType) {
    this.draftState[mode].terrains[index] = terrain
  }

  invalidate(mode: Mode) {
    this.draftState[mode].outdated = true
  }

  invalidateCountry(country: CountryName) {
    keys(this.state).forEach(key => {
      if (toArr(this.state[key].participants).find(value => value.country === country))
        this.invalidate(key)
    })
  }

  undo(mode: Mode, steps: number) {
    const draft = this.draftState[mode]
    for (let step = 0; step < steps && draft.round > -1; ++step) {
      let seed: number = draft.seed
      if (draft.round < 2)
        seed = draft.custom_seed ? draft.custom_seed : 0
      forEach(draft.participants, value => {
        value.rounds.pop()
        value.roll = arrGet(value.rolls, -2, { roll: value.roll }).roll
        value.rolls.pop()
      })
      draft.round--
      draft.seed = seed
      draft.fight_over = false
    }
  }

  toggleRandomRoll(mode: Mode, side: Side) {
    const state = this.state[mode].participants[side]
    const draft = this.draftState[mode].participants[side]
    draft.randomize_roll = !state.randomize_roll
  }

  setRoll(mode: Mode, side: Side, roll: number) {
    const draft = this.draftState[mode].participants[side]
    draft.roll = roll
  }

  selectArmy(mode: Mode, side: Side, name: CountryName) {
    const draft = this.draftState[mode].participants[side]
    draft.country = name
  }
}


const actions = createActionCreators(BattleReducer)

export const invalidate = actions.invalidate
export const invalidateCountry = actions.invalidateCountry
export const undo = actions.undo
export const toggleRandomRoll = actions.toggleRandomRoll
export const setRoll = actions.setRoll
export const selectArmy = actions.selectArmy
export const selectTerrain = actions.selectTerrain


export const battleReducer = createReducerFunction(BattleReducer, getDefaultBattle())
