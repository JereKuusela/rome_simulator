const core = require('./core')
const units = require('./ir_units')
const tech = require('./ir_tech')
const traits = require('./ir_traits')
const traditions = require('./ir_traditions')
const heritages = require('./ir_heritages')
const trades = require('./ir_trades')

core.loadLocalizations('ir')
units.run()
tech.run()
traits.run()
traditions.run()
heritages.run()
trades.run()