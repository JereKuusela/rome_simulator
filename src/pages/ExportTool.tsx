import React from 'react'
import ExportPops from 'saves/ExportPops'
import FindCharacter from 'saves/FindCharacter'
import { Tab } from 'semantic-ui-react'

const ExportTool = () => {
  const panes = [
    {
      menuItem: 'Characters',
      render: () => <FindCharacter />
    },
    {
      menuItem: 'Pops',
      render: () => <ExportPops />
    }
  ]
  return <Tab panes={panes} defaultActiveIndex={0} />
}

export default ExportTool
