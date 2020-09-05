const core = require('./core')
const tech = require('./tech')
const units = require('./units')
const policies = require('./policies')

core.loadLocalizations()
units.run()
tech.run()
policies.run()