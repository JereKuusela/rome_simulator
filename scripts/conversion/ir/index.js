/* eslint-disable @typescript-eslint/no-var-requires */
const core = require('./core')
const units = require('./units')
const parentunits = require('./parentunits')
const inventions = require('./inventions')
const traits = require('./traits')
const traditions = require('./traditions')
const heritages = require('./heritages')
const trades = require('./trades')
const ideas = require('./ideas')
const laws = require('./laws')
const policies = require('./policies')
const deities = require('./deities')
const countries = require('./countries')
const religions = require('./religions')
const parties = require('./parties')
const effects = require('./effects')
const config = require('./config')
const territories = require('./territories')
const cultures = require('./cultures')
const terrains = require('./terrains')
const distinctions = require('./distinctions')

core.loadLocalizations()
core.loadScriptValues()
units.run()
parentunits.run()
inventions.run()
traits.run()
traditions.run()
heritages.run()
trades.run()
ideas.run()
laws.run()
policies.run()
countries.run()
deities.run()
religions.run()
parties.run()
effects.run()
config.run()
territories.run()
cultures.run()
terrains.run()
distinctions.run()
