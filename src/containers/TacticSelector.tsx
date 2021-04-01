import React from 'react'
import { useDispatch } from 'react-redux'
import { selectTactic } from 'reducers'
import { SideType, TacticType } from 'types'
import DropdownTactic from 'components/Dropdowns/DropdownTactic'
import { useGeneral, useParticipant, useCombatSettings, useTactics } from 'selectors'

type Props = {
  side: SideType
  index: number
}

const TacticSelector = ({ index, side }: Props) => {
  const tactics = useTactics(side)
  const settings = useCombatSettings()
  const { countryName, armyName } = useParticipant(side, index)
  const tactic = useGeneral(countryName, armyName).tactic.type

  const dispatch = useDispatch()
  const handleSelect = (type: TacticType) => {
    dispatch(selectTactic(countryName, armyName, type))
  }
  return <DropdownTactic values={tactics} value={tactic} onSelect={handleSelect} settings={settings} />
}

export default TacticSelector
