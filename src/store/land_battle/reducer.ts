import { createReducer } from 'typesafe-actions'
import { List } from 'immutable'
import { getInitialArmy, getInitialTerrains } from './types'
import { selectUnit, selectDefeatedUnit, selectTerrain, battle, selectTactic, undo } from './actions'
import { ArmyType, setBaseValue as setUnitBaseValue, setModifierValue, setLossValue, setGlobalBaseValue, setGlobalModifierValue, setGlobalLossValue, UnitDefinition, UnitType, ValueType } from '../units'
import { battle as fight } from './combat'
import { setBaseValue as setTacticBaseValue } from '../tactics'
import { setBaseValue as setTerrainBaseValue } from '../terrains'

export const initialState = {
  attacker: getInitialArmy(),
  defender: getInitialArmy(),
  terrains: getInitialTerrains(),
  day: 0
}

const updateBaseValue = (army_type: ArmyType, army: List<List<UnitDefinition | null>>, payload: { army: ArmyType, unit: UnitType, key: string, attribute: ValueType, value: number }) => {
  return army.map(row => row.map(unit => payload.army === army_type && unit && unit.type === payload.unit ? unit.add_base_value(payload.key, payload.attribute, payload.value) : unit))
}
const updateModifierValue = (army_type: ArmyType, army: List<List<UnitDefinition | null>>, payload: { army: ArmyType, unit: UnitType, key: string, attribute: ValueType, value: number }) => {
  return army.map(row => row.map(unit => payload.army === army_type && unit && unit.type === payload.unit ? unit.add_modifier_value(payload.key, payload.attribute, payload.value) : unit))
}
const updateLossValue = (army_type: ArmyType, army: List<List<UnitDefinition | null>>, payload: { army: ArmyType, unit: UnitType, key: string, attribute: ValueType, value: number }) => {
  return army.map(row => row.map(unit => payload.army === army_type && unit && unit.type === payload.unit ? unit.add_loss_value(payload.key, payload.attribute, payload.value) : unit))
}
const updateGlobalBaseValue = (army_type: ArmyType, army: List<List<UnitDefinition | null>>, payload: { army: ArmyType, key: string, attribute: ValueType, value: number }) => {
  return army.map(row => row.map(unit => payload.army === army_type && unit ? unit.add_base_value(payload.key, payload.attribute, payload.value) : unit))
}
const updateGlobalModifierValue = (army_type: ArmyType, army: List<List<UnitDefinition | null>>, payload: { army: ArmyType, key: string, attribute: ValueType, value: number }) => {
  return army.map(row => row.map(unit => payload.army === army_type && unit ? unit.add_modifier_value(payload.key, payload.attribute, payload.value) : unit))
}
const updateGlobalLossValue = (army_type: ArmyType, army: List<List<UnitDefinition | null>>, payload: { army: ArmyType, key: string, attribute: ValueType, value: number }) => {
  return army.map(row => row.map(unit => payload.army === army_type && unit ? unit.add_loss_value(payload.key, payload.attribute, payload.value) : unit))
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
        army: updateBaseValue(ArmyType.Attacker, state.attacker.army, action.payload),
        defeated_army: updateBaseValue(ArmyType.Attacker, state.attacker.defeated_army, action.payload),
        past: state.attacker.past.map(armies => ({ army: updateBaseValue(ArmyType.Attacker, armies.army, action.payload), defeated_army: updateBaseValue(ArmyType.Attacker, armies.defeated_army, action.payload) }))
      },
      defender: {
        ...state.defender,
        army: updateBaseValue(ArmyType.Defender, state.defender.army, action.payload),
        defeated_army: updateBaseValue(ArmyType.Defender, state.defender.defeated_army, action.payload),
        past: state.defender.past.map(armies => ({ army: updateBaseValue(ArmyType.Defender, armies.army, action.payload), defeated_army: updateBaseValue(ArmyType.Defender, armies.defeated_army, action.payload) }))
      }
    }
  ))
  .handleAction(setModifierValue, (state, action: ReturnType<typeof setModifierValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: updateModifierValue(ArmyType.Attacker, state.attacker.army, action.payload),
        defeated_army: updateModifierValue(ArmyType.Attacker, state.attacker.defeated_army, action.payload),
        past: state.attacker.past.map(armies => ({ army: updateModifierValue(ArmyType.Attacker, armies.army, action.payload), defeated_army: updateModifierValue(ArmyType.Attacker, armies.defeated_army, action.payload) }))
      },
      defender: {
        ...state.defender,
        army: updateModifierValue(ArmyType.Defender, state.defender.army, action.payload),
        defeated_army: updateModifierValue(ArmyType.Defender, state.defender.defeated_army, action.payload),
        past: state.defender.past.map(armies => ({ army: updateModifierValue(ArmyType.Defender, armies.army, action.payload), defeated_army: updateModifierValue(ArmyType.Defender, armies.defeated_army, action.payload) }))
      }
    }
  ))
  .handleAction(setLossValue, (state, action: ReturnType<typeof setLossValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: updateLossValue(ArmyType.Attacker, state.attacker.army, action.payload),
        defeated_army: updateLossValue(ArmyType.Attacker, state.attacker.defeated_army, action.payload),
        past: state.attacker.past.map(armies => ({ army: updateLossValue(ArmyType.Attacker, armies.army, action.payload), defeated_army: updateLossValue(ArmyType.Attacker, armies.defeated_army, action.payload) }))
      },
      defender: {
        ...state.defender,
        army: updateLossValue(ArmyType.Defender, state.defender.army, action.payload),
        defeated_army: updateLossValue(ArmyType.Defender, state.defender.defeated_army, action.payload),
        past: state.defender.past.map(armies => ({ army: updateLossValue(ArmyType.Defender, armies.army, action.payload), defeated_army: updateLossValue(ArmyType.Defender, armies.defeated_army, action.payload) }))
      }
    }
  ))
  .handleAction(setGlobalBaseValue, (state, action: ReturnType<typeof setGlobalBaseValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: updateGlobalBaseValue(ArmyType.Attacker, state.attacker.army, action.payload),
        defeated_army: updateGlobalBaseValue(ArmyType.Attacker, state.attacker.defeated_army, action.payload),
        past: state.attacker.past.map(armies => ({ army: updateGlobalBaseValue(ArmyType.Attacker, armies.army, action.payload), defeated_army: updateGlobalBaseValue(ArmyType.Attacker, armies.defeated_army, action.payload) }))
      },
      defender: {
        ...state.defender,
        army: updateGlobalBaseValue(ArmyType.Defender, state.defender.army, action.payload),
        defeated_army: updateGlobalBaseValue(ArmyType.Defender, state.defender.defeated_army, action.payload),
        past: state.defender.past.map(armies => ({ army: updateGlobalBaseValue(ArmyType.Defender, armies.army, action.payload), defeated_army: updateGlobalBaseValue(ArmyType.Defender, armies.defeated_army, action.payload) }))
      }
    }
  ))
  .handleAction(setGlobalModifierValue, (state, action: ReturnType<typeof setGlobalModifierValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: updateGlobalModifierValue(ArmyType.Attacker, state.attacker.army, action.payload),
        defeated_army: updateGlobalModifierValue(ArmyType.Attacker, state.attacker.defeated_army, action.payload),
        past: state.attacker.past.map(armies => ({ army: updateGlobalModifierValue(ArmyType.Attacker, armies.army, action.payload), defeated_army: updateGlobalModifierValue(ArmyType.Attacker, armies.defeated_army, action.payload) }))
      },
      defender: {
        ...state.defender,
        army: updateGlobalModifierValue(ArmyType.Defender, state.defender.army, action.payload),
        defeated_army: updateGlobalModifierValue(ArmyType.Defender, state.defender.defeated_army, action.payload),
        past: state.defender.past.map(armies => ({ army: updateGlobalModifierValue(ArmyType.Defender, armies.army, action.payload), defeated_army: updateGlobalModifierValue(ArmyType.Defender, armies.defeated_army, action.payload) }))
      }
    }
  ))
  .handleAction(setGlobalLossValue, (state, action: ReturnType<typeof setGlobalLossValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: updateGlobalLossValue(ArmyType.Attacker, state.attacker.army, action.payload),
        defeated_army: updateGlobalLossValue(ArmyType.Attacker, state.attacker.defeated_army, action.payload),
        past: state.attacker.past.map(armies => ({ army: updateGlobalLossValue(ArmyType.Attacker, armies.army, action.payload), defeated_army: updateGlobalLossValue(ArmyType.Attacker, armies.defeated_army, action.payload) }))
      },
      defender: {
        ...state.defender,
        army: updateGlobalLossValue(ArmyType.Defender, state.defender.army, action.payload),
        defeated_army: updateGlobalLossValue(ArmyType.Defender, state.defender.defeated_army, action.payload),
        past: state.defender.past.map(armies => ({ army: updateGlobalLossValue(ArmyType.Defender, armies.army, action.payload), defeated_army: updateGlobalLossValue(ArmyType.Defender, armies.defeated_army, action.payload) }))
      }
    }
  ))
