import { Battle, TerrainType, Side, CountryName } from "types"
import { forEach, arrGet } from "utils"

export const selectTerrain = (battle: Battle, index: number, terrain: TerrainType) => {
  battle.terrains[index] = terrain
}

export const invalidate = (battle: Battle) => {
  battle.outdated = true
}

export const setSeed = (battle: Battle, seed: number) => {
  battle.custom_seed = seed || undefined
  battle.seed = seed
}

export const undo = (battle: Battle, steps: number) => {
  for (let step = 0; step < steps && battle.round > -1; ++step) {
    let seed: number = battle.seed
    if (battle.round < 2)
      seed = battle.custom_seed ? battle.custom_seed : 0
    forEach(battle.participants, value => {
      value.rounds.pop()
      value.dice = arrGet(value.rolls, -2, { dice: value.dice }).dice
      value.rolls.pop()
    })
    battle.round--
    battle.seed = seed
    battle.fight_over = false
    battle.timestamp = new Date().getMilliseconds()
  }
}

export const toggleRandomRoll = (battle: Battle, side: Side) => {
  const participant = battle.participants[side]
  participant.randomize_roll = !participant.randomize_roll
}

export const setRoll = (battle: Battle, side: Side, roll: number) => {
  battle.participants[side].dice = roll
}

export const selectArmy = (battle: Battle, side: Side, name: CountryName) => {
  battle.participants[side].country = name
}
