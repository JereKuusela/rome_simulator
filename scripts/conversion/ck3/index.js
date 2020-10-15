const core = require('./core')
const units = require('./units')

core.loadLocalizations()
core.loadScriptValues()
units.run()