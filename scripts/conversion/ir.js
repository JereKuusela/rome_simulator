const core = require('./core')
const units = require('./ir_units')
const tech = require('./ir_tech')
const traits = require('./ir_traits')
const traditions = require('./ir_traditions')
const heritages = require('./ir_heritages')
const trades = require('./ir_trades')
const ideas = require('./ir_ideas')
const laws = require('./ir_laws')
const policies = require('./ir_policies')
const deities = require('./ir_deities')
const countries = require('./ir_countries')

core.loadLocalizations('ir')
core.loadScriptValues('ir')
units.run()
tech.run()
traits.run()
traditions.run()
heritages.run()
trades.run()
ideas.run()
laws.run()
policies.run()
countries.run()
deities.run()