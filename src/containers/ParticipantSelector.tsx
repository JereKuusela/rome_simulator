import React from 'react'

import { selectParticipant } from 'reducers'
import { SideType } from 'types'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import { getParticipantName } from 'managers/battle'
import { useParticipants, useSelectedParticipantIndex } from 'selectors'
import { useDispatch } from 'react-redux'

type Props = {
  sideType: SideType
}

/**
 * Selector for an active participant.
 */
const ParticipantSelector = ({ sideType }: Props) => {
  const participants = useParticipants(sideType)
  const value = useSelectedParticipantIndex(sideType)
  const values = participants.map((item, index) => ({
    value: index,
    text: getParticipantName(item)
  }))

  const dispatch = useDispatch()
  const handleChange = (value: number) => dispatch(selectParticipant(sideType, value))

  return (
    <span>
      <span>Edit army: </span>
      <SimpleDropdown value={value} values={values} onChange={handleChange} />
    </span>
  )
}

export default ParticipantSelector
