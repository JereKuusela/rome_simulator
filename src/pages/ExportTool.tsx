import React from 'react'
import ExportPops from 'saves/ExportPops'
import { Tab } from 'semantic-ui-react'

const ExportTool = () => {
  const panes = [
    {
      menuItem: 'Pops',
      render: () => <ExportPops />
    }
  ]
  return <Tab panes={panes} defaultActiveIndex={0} />
}

export default ExportTool
