import { createReducer } from 'typesafe-actions'
import { getInitialArmy, getInitialTerrains } from './types'
import { selectUnit, selectTerrain, battle, selectTactic } from './actions'
import { ArmyType, setBaseValue as setUnitBaseValue, setModifierValue, setLossValue, setGlobalBaseValue, setGlobalModifierValue, setGlobalLossValue } from '../units'
import { battle as fight } from './combat'
import { setBaseValue as setTacticBaseValue} from '../tactics'
import { setBaseValue as setTerrainBaseValue} from '../terrains'

export const initialState = {
  attacker: getInitialArmy(),
  defender: getInitialArmy(),
  terrains: getInitialTerrains(),
  day: 0
}

export const landBattleReducer = createReducer(initialState)
  .handleAction(selectUnit, (state, action: ReturnType<typeof selectUnit>) => (
    {
      ...state,
      attacker: { ...state.attacker, army: action.payload.army === ArmyType.Attacker ? state.attacker.army.setIn([action.payload.row, action.payload.column], action.payload.unit) : state.attacker.army },
      defender: { ...state.defender, army: action.payload.army === ArmyType.Defender ? state.defender.army.setIn([action.payload.row, action.payload.column], action.payload.unit) : state.defender.army }
    }
  ))
  .handleAction(selectTerrain, (state, action: ReturnType<typeof selectTerrain>) => (
    {
      ...state,
      terrains: state.terrains.set(action.payload.index, action.payload.terrain)
    }
  ))
  .handleAction(selectTactic, (state, action: ReturnType<typeof selectTactic>) => (
    {
      ...state,
      attacker: { ...state.attacker, tactic: action.payload.army === ArmyType.Attacker ? action.payload.tactic : state.attacker.tactic },
      defender: { ...state.defender, tactic: action.payload.army === ArmyType.Defender ? action.payload.tactic : state.defender.tactic }
    }
  ))
  .handleAction(battle, (state, action: ReturnType<typeof battle>) => {
    let [attacker, defender] = fight(state.attacker.army, state.defender.army, 3, 3, state.attacker.tactic, state.defender.tactic, state.day, state.terrains)
    return {
      ...state,
      attacker: { ...state.attacker, army: attacker},
      defender: { ...state.defender, army: defender},
      day: state.day + 1
    }
  }
  )
  .handleAction(setTacticBaseValue, (state, action: ReturnType<typeof setTacticBaseValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        tactic: state.attacker.tactic && action.payload.tactic === state.attacker.tactic.type ? state.attacker.tactic.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : state.attacker.tactic
      },
      defender: {
        ...state.defender,
        tactic: state.defender.tactic && action.payload.tactic === state.defender.tactic.type ? state.defender.tactic.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : state.defender.tactic
      }
    }
  ))
  .handleAction(setTerrainBaseValue, (state, action: ReturnType<typeof setTerrainBaseValue>) => (
    {
      ...state,
      terrains: state.terrains.map(terrain => terrain.type === action.payload.terrain ? terrain.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : terrain)
    }
  ))
  .handleAction(setUnitBaseValue, (state, action: ReturnType<typeof setUnitBaseValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: state.attacker.army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit && unit.type === action.payload.unit ? unit.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      },
      defender: {
        ...state.defender,
        army: state.defender.army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit && unit.type === action.payload.unit ? unit.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      }
    }
  ))
  .handleAction(setModifierValue, (state, action: ReturnType<typeof setModifierValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: state.attacker.army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit && unit.type === action.payload.unit ? unit.add_modifier_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      },
      defender: {
        ...state.defender,
        army: state.defender.army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit && unit.type === action.payload.unit ? unit.add_modifier_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      }
    }
  ))
  .handleAction(setLossValue, (state, action: ReturnType<typeof setLossValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: state.attacker.army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit && unit.type === action.payload.unit ? unit.add_loss_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      },
      defender: {
        ...state.defender,
        army: state.defender.army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit && unit.type === action.payload.unit ? unit.add_loss_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      }
    }
  ))
  .handleAction(setGlobalBaseValue, (state, action: ReturnType<typeof setGlobalBaseValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: state.attacker.army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit ? unit.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      },
      defender: {
        ...state.defender,
        army: state.defender.army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit ? unit.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      }
    }
  ))
  .handleAction(setGlobalModifierValue, (state, action: ReturnType<typeof setGlobalModifierValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: state.attacker.army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit ? unit.add_modifier_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      },
      defender: {
        ...state.defender,
        army: state.defender.army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit ? unit.add_modifier_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      }
    }
  ))
  .handleAction(setGlobalLossValue, (state, action: ReturnType<typeof setGlobalLossValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: state.attacker.army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit ? unit.add_loss_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      },
      defender: {
        ...state.defender,
        army: state.defender.army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit ? unit.add_loss_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      }
    }
  ))
