import { createReducer } from 'typesafe-actions'
import { getInitialArmy, getInitialTerrains } from './types'
import { selectUnit, selectDefeatedUnit, selectTerrain, battle, selectTactic, undo } from './actions'
import { ArmyType, setBaseValue as setUnitBaseValue, setModifierValue, setLossValue, setGlobalBaseValue, setGlobalModifierValue, setGlobalLossValue } from '../units'
import { battle as fight } from './combat'
import { setBaseValue as setTacticBaseValue } from '../tactics'
import { setBaseValue as setTerrainBaseValue } from '../terrains'

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
  .handleAction(selectDefeatedUnit, (state, action: ReturnType<typeof selectDefeatedUnit>) => (
    {
      ...state,
      attacker: { ...state.attacker, defeated_army: action.payload.army === ArmyType.Attacker ? state.attacker.defeated_army.setIn([action.payload.row, action.payload.column], action.payload.unit) : state.attacker.defeated_army },
      defender: { ...state.defender, defeated_army: action.payload.army === ArmyType.Defender ? state.defender.defeated_army.setIn([action.payload.row, action.payload.column], action.payload.unit) : state.defender.defeated_army }
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
    let next = state
    for (let step = 0; step < action.payload.steps; ++step) {
      let [attacker, defender, attacker_defeated_army, defender_defeated_army] = fight(next.attacker.army, next.defender.army, next.attacker.defeated_army, next.defender.defeated_army, 3, 3, next.attacker.tactic, next.defender.tactic, next.day, next.terrains)
      next = {
        ...next,
        attacker: {
          ...next.attacker,
          army: attacker,
          defeated_army: attacker_defeated_army,
          past: next.attacker.past.push({ army: next.attacker.army, defeated_army: next.attacker.defeated_army })
        },
        defender: {
          ...next.defender,
          army: defender,
          defeated_army: defender_defeated_army,
          past: next.defender.past.push({ army: next.defender.army, defeated_army: next.defender.defeated_army })
        },
        day: next.day + 1
      }
    }
    return next
  }
  )
  .handleAction(undo, (state, action: ReturnType<typeof undo>) => {
    let next = state
    for (let step = 0; step < action.payload.steps && next.day > 0; ++step) {
      const attacker_past = next.attacker.past.get(-1)
      const defender_past = next.defender.past.get(-1)
      next = {
        ...next,
        attacker: {
          ...next.attacker,
          army: attacker_past ? attacker_past.army : next.attacker.army,
          defeated_army: attacker_past ? attacker_past.defeated_army : next.attacker.defeated_army,
          past: next.attacker.past.pop()
        },
        defender: {
          ...next.defender,
          army: defender_past ? defender_past.army : next.defender.army,
          defeated_army: defender_past ? defender_past.defeated_army : next.defender.defeated_army,
          past: next.defender.past.pop()
        },
        day: next.day - 1
      }
    }
    return next
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
        army: state.attacker.army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit && unit.type === action.payload.unit ? unit.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : unit)),
        defeated_army: state.attacker.defeated_army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit && unit.type === action.payload.unit ? unit.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      },
      defender: {
        ...state.defender,
        army: state.defender.army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit && unit.type === action.payload.unit ? unit.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : unit)),
        defeated_army: state.defender.defeated_army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit && unit.type === action.payload.unit ? unit.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      }
    }
  ))
  .handleAction(setModifierValue, (state, action: ReturnType<typeof setModifierValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: state.attacker.army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit && unit.type === action.payload.unit ? unit.add_modifier_value(action.payload.key, action.payload.attribute, action.payload.value) : unit)),
        defeated_army: state.attacker.defeated_army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit && unit.type === action.payload.unit ? unit.add_modifier_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      },
      defender: {
        ...state.defender,
        army: state.defender.army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit && unit.type === action.payload.unit ? unit.add_modifier_value(action.payload.key, action.payload.attribute, action.payload.value) : unit)),
        defeated_army: state.defender.defeated_army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit && unit.type === action.payload.unit ? unit.add_modifier_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      }
    }
  ))
  .handleAction(setLossValue, (state, action: ReturnType<typeof setLossValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: state.attacker.army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit && unit.type === action.payload.unit ? unit.add_loss_value(action.payload.key, action.payload.attribute, action.payload.value) : unit)),
        defeated_army: state.attacker.defeated_army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit && unit.type === action.payload.unit ? unit.add_loss_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      },
      defender: {
        ...state.defender,
        army: state.defender.army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit && unit.type === action.payload.unit ? unit.add_loss_value(action.payload.key, action.payload.attribute, action.payload.value) : unit)),
        defeated_army: state.defender.defeated_army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit && unit.type === action.payload.unit ? unit.add_loss_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      }
    }
  ))
  .handleAction(setGlobalBaseValue, (state, action: ReturnType<typeof setGlobalBaseValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: state.attacker.army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit ? unit.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : unit)),
        defeated_army: state.attacker.defeated_army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit ? unit.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      },
      defender: {
        ...state.defender,
        army: state.defender.army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit ? unit.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : unit)),
        defeated_army: state.defender.defeated_army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit ? unit.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      }
    }
  ))
  .handleAction(setGlobalModifierValue, (state, action: ReturnType<typeof setGlobalModifierValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: state.attacker.army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit ? unit.add_modifier_value(action.payload.key, action.payload.attribute, action.payload.value) : unit)),
        defeated_army: state.attacker.defeated_army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit ? unit.add_modifier_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      },
      defender: {
        ...state.defender,
        army: state.defender.army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit ? unit.add_modifier_value(action.payload.key, action.payload.attribute, action.payload.value) : unit)),
        defeated_army: state.defender.defeated_army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit ? unit.add_modifier_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      }
    }
  ))
  .handleAction(setGlobalLossValue, (state, action: ReturnType<typeof setGlobalLossValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: state.attacker.army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit ? unit.add_loss_value(action.payload.key, action.payload.attribute, action.payload.value) : unit)),
        defeated_army: state.attacker.defeated_army.map(row => row.map(unit => action.payload.army === ArmyType.Attacker && unit ? unit.add_loss_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      },
      defender: {
        ...state.defender,
        army: state.defender.army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit ? unit.add_loss_value(action.payload.key, action.payload.attribute, action.payload.value) : unit)),
        defeated_army: state.defender.defeated_army.map(row => row.map(unit => action.payload.army === ArmyType.Defender && unit ? unit.add_loss_value(action.payload.key, action.payload.attribute, action.payload.value) : unit))
      }
    }
  ))
