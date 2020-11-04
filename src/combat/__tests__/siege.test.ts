import { Random, MersenneTwister19937, createEntropy } from 'random-js'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const percentile = require('percentile')

// Not really a test. Simulator for sieges.
describe('siege', () => {
  it('works', () => {
    const min = -5
    const max = -10
    const iterations = 1000000
    const seed = createEntropy()[0]
    const engine = MersenneTwister19937.seed(seed)
    const rng = new Random(engine)
    console.log(
      '! Initial modifier !! Average !! Very lucky (5th pct) !! Lucky (25th pct) !! Expected (50th pct) !! Unlucky (75th pct) !! Very unlucky (95th pct) !! Disease chance !! Assault chance !! Intervals saved  !! Intervals saved (total) !! Garrison depleted'
    )

    for (let delta = min; delta <= max; delta++) {
      let garrisonLow = 0
      let diseases = 0
      let assaults = 0
      const results = []
      let total = 0
      let intervalsSaved = 0
      for (let iteration = 0; iteration < iterations; iteration++) {
        let accumulation = 0
        let roll = 1
        let breach = false
        let garrison = 1.0
        let assaulted = false
        for (; roll < 10000; roll++) {
          const roll = rng.integer(1, 14)
          const modded = roll + accumulation + delta

          if (garrison < 0.1) {
            garrisonLow++
            break
          }

          if (modded > 19)
            // Surrender
            break
          else if (roll === 14) {
            // Breach
            accumulation += 2
            breach = true
            garrison *= 0.95
          } else if (modded > 15) {
            // Desert
            accumulation += 2
            garrison *= 0.9
          } else if (modded > 13) {
            // Water
            accumulation += 3
            garrison *= 0.95
          } else if (modded > 11) {
            // Food
            accumulation += 2
            garrison *= 0.97
          } else if (modded > 4) {
            // Supplies
            accumulation += 1
            garrison *= 0.99
          } else if (modded === 1)
            // Disease
            diseases += 1
          // Status Quo
          accumulation = Math.min(accumulation, 11)

          if (!assaulted && garrison <= 0.5) {
            assaulted = true
            assaults++
          }
          if (!assaulted && breach && garrison <= 0.75) {
            assaulted = true
            assaults++
          }
          if (assaulted) intervalsSaved++
        }
        results.push(roll)
        total += roll
      }
      console.log(
        '| ' +
          delta +
          ' || ' +
          total / iterations +
          ' || ' +
          percentile(5, results) +
          ' || ' +
          percentile(25, results) +
          ' || ' +
          percentile(50, results) +
          ' || ' +
          percentile(75, results) +
          ' || ' +
          percentile(95, results) +
          ' || ' +
          diseases / iterations +
          ' || ' +
          assaults / iterations +
          ' || ' +
          intervalsSaved / assaults +
          ' || ' +
          intervalsSaved / iterations +
          ' || ' +
          garrisonLow / iterations
      )
    }
  })
})
