import React, { PropsWithChildren } from 'react'
import { useDispatch } from 'react-redux'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import ValueDropdownModal from 'components/ValueDropdownModal'
import { Grid, Button } from 'semantic-ui-react'
import { CountryName, ModalType, ArmyName } from 'types'
import {
  createCountry,
  changeCountryName,
  deleteCountry,
  createArmy,
  changeArmyName,
  deleteArmy,
  selectCountry,
  selectArmy,
  openModal
} from 'reducers'
import {
  useArmyNames,
  useCountryNames,
  useMode,
  useSelectedArmyIndex,
  useSelectedCountry,
  useSelectedCountryIndex
} from 'selectors'
import { useBooleanState } from 'components/hooks'

const CountryManager = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <Grid>
      <RenderCountryRow>{children}</RenderCountryRow>
      <RenderArmyRow />
    </Grid>
  )
}

const useCountryEditors = (countryName: CountryName, index: number, length: number) => {
  const dispatch = useDispatch()

  const handleSelect = (index: number) => dispatch(selectCountry(index))

  const handleChangeName = (name: string) => {
    dispatch(changeCountryName(countryName, name as CountryName))
  }
  const handleEdit = () =>
    dispatch(
      openModal(ModalType.Value, {
        onSuccess: handleChangeName,
        message: 'Rename country',
        buttonMessage: 'Edit',
        initial: countryName
      })
    )

  const handleDelete = () => {
    dispatch(deleteCountry(countryName))
    dispatch(handleSelect(index - 1))
  }

  const handleCreate = (country: CountryName, source?: CountryName) => {
    dispatch(createCountry(country, source))
    dispatch(selectCountry(length))
  }
  return { handleCreate, handleDelete, handleEdit, handleSelect }
}

const RenderCountryRow = ({ children }: PropsWithChildren<unknown>) => {
  const [open, toggleOpen] = useBooleanState(false)
  const country = useSelectedCountryIndex()
  const countryNames = useCountryNames()
  const values = countryNames.map((name, index) => ({ text: name, value: index }))

  const { handleCreate, handleDelete, handleEdit, handleSelect } = useCountryEditors(
    countryNames[country],
    country,
    countryNames.length
  )
  return (
    <Grid.Row columns='5'>
      <ValueDropdownModal
        value={'' as CountryName}
        selected={'' as CountryName}
        open={open}
        onSuccess={handleCreate}
        onClose={toggleOpen}
        items={countryNames}
        message='New country'
        buttonMessage='Create'
        valueLabel='Name '
        dropdownLabel='Copy country: '
      />
      <Grid.Column>
        <SimpleDropdown values={values} value={country} onChange={handleSelect} />
      </Grid.Column>
      <Grid.Column>
        <Button primary onClick={toggleOpen}>
          New country
        </Button>
      </Grid.Column>
      <Grid.Column>
        <Button primary onClick={handleEdit}>
          Rename country
        </Button>
      </Grid.Column>
      <Grid.Column>
        <Button primary onClick={handleDelete} disabled={countryNames.length < 2}>
          Delete country
        </Button>
      </Grid.Column>
      {React.Children.map(children, elem => (
        <Grid.Column>{elem}</Grid.Column>
      ))}
    </Grid.Row>
  )
}

const useArmyEditors = (countryName: CountryName, armyName: ArmyName, index: number, length: number) => {
  const dispatch = useDispatch()
  const mode = useMode()

  const handleSelect = (index: number) => dispatch(selectArmy(index))

  const handleChangeName = (name: string) => {
    dispatch(changeArmyName(countryName, armyName, name as ArmyName))
  }

  const handleEdit = () => {
    dispatch(
      openModal(ModalType.Value, {
        onSuccess: handleChangeName,
        message: 'Rename army',
        buttonMessage: 'Edit',
        initial: armyName
      })
    )
  }

  const handleCreate = (army: ArmyName, sourceArmy?: ArmyName) => {
    dispatch(createArmy(countryName, army, mode, sourceArmy))
    dispatch(selectArmy(length))
  }

  const handleDelete = () => {
    dispatch(deleteArmy(countryName, armyName))
    handleSelect(index - 1)
  }

  return { handleCreate, handleDelete, handleEdit, handleSelect }
}

const RenderArmyRow = () => {
  const [open, toggleOpen] = useBooleanState(false)
  const countryName = useSelectedCountry()
  const army = useSelectedArmyIndex()
  const armyNames = useArmyNames(countryName)
  const values = armyNames.map((name, index) => ({ text: name, value: index }))

  const { handleCreate, handleDelete, handleEdit, handleSelect } = useArmyEditors(
    countryName,
    armyNames[army],
    army,
    armyNames.length
  )
  return (
    <Grid.Row columns='5'>
      <ValueDropdownModal
        value={'' as ArmyName}
        selected={'' as ArmyName}
        open={open}
        onSuccess={handleCreate}
        onClose={toggleOpen}
        items={armyNames}
        message='New army'
        buttonMessage='Create'
        valueLabel='Name '
        dropdownLabel='Copy army: '
      />
      <Grid.Column>
        <SimpleDropdown values={values} value={army} onChange={handleSelect} />
      </Grid.Column>
      <Grid.Column>
        <Button primary onClick={toggleOpen}>
          New army
        </Button>
      </Grid.Column>
      <Grid.Column>
        <Button primary onClick={handleEdit}>
          Rename army
        </Button>
      </Grid.Column>
      <Grid.Column>
        <Button primary onClick={handleDelete} disabled={armyNames.length < 2}>
          Delete army
        </Button>
      </Grid.Column>
    </Grid.Row>
  )
}

export default CountryManager
