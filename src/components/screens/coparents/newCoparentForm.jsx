// Path: src\components\screens\coparents\newCoparentForm.jsx
import React, {useContext, useState} from 'react'
import globalState from '../../../context'
import Coparent from '/src/models/coparent'
import Manager from '/src/managers/manager'
import CheckboxGroup from '/src/components/shared/checkboxGroup'
import InputWrapper from '/src/components/shared/inputWrapper'
import Modal from '/src/components/shared/modal'
import AlertManager from '/src/managers/alertManager'
import validator from 'validator'
import StringManager from '../../../managers/stringManager'
import Spacer from '../../shared/spacer'
import DB from '../../../database/DB'
import ModelNames from '../../../models/modelNames'
import ObjectManager from '../../../managers/objectManager'
import ViewSelector from '../../shared/viewSelector'
import DB_UserScoped from '../../../database/db_userScoped'
import InputTypes from '../../../constants/inputTypes'

const NewCoparentForm = ({showCard, hideCard}) => {
  const {state, setState} = useContext(globalState)
  const {currentUser, theme, authUser} = state
  const [linkOrNew, setLinkOrNew] = useState('new')

  // State
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [parentType, setParentType] = useState('')
  const [relationshipType, setRelationshipType] = useState('')

  const ResetForm = async (successMessage = '') => {
    Manager.ResetForm('new-coparent-wrapper')
    setName('')
    setAddress('')
    setEmail('')
    setParentType('')
    setState({...state, refreshKey: Manager.getUid(), successAlertMessage: successMessage})
    hideCard()
  }

  const Submit = async () => {
    if (!validator.isEmail(email)) {
      AlertManager.throwError('Email address is not valid')
      return false
    }
    const invalidInputs = Manager.GetInvalidInputsErrorString([email, address, name, parentType])
    let newCoparent = new Coparent()
    if (!invalidInputs) {
      AlertManager.throwError('All fields are required')
    } else {
      const users = await DB.getTable(`${DB.tables.users}`)
      const coparent = users.find((x) => x.email === email)

      // Link coparent with an existing user/profile
      if (Manager.isValid(coparent)) {
        newCoparent.id = Manager.getUid()
        newCoparent.userKey = coparent?.key
        newCoparent.address = address
        newCoparent.name = StringManager.uppercaseFirstLetterOfAllWords(coparent?.name.trim())
        newCoparent.parentType = parentType
        newCoparent.relationshipToMe = relationshipType
        newCoparent.phone = coparent?.phone
      }
      // Create new coparent
      else {
        newCoparent.id = Manager.getUid()
        newCoparent.key = Manager.getUid()
        newCoparent.address = address
        newCoparent.name = StringManager.uppercaseFirstLetterOfAllWords(name.trim())
        newCoparent.parentType = parentType
        newCoparent.relationshipToMe = relationshipType
      }

      const cleanCoparent = ObjectManager.cleanObject(newCoparent, ModelNames.coparent)
      try {
        await DB_UserScoped.addCoparent(currentUser, cleanCoparent)
      } catch (error) {
        console.log(error)
        // LogManager.log(error.message, LogManager.logTypes.error)
      }
      await ResetForm(`${StringManager.getFirstNameOnly(name)} Added!`)
    }
  }

  const HandleCoparentType = (e) => {
    const type = e.dataset['key']
    Manager.handleCheckboxSelection(
      e,
      () => {
        setParentType(type)
      },
      () => {
        setParentType('')
      }
    )
  }

  return (
    <Modal
      onSubmit={Submit}
      submitText={name.length > 0 ? `Add ${StringManager.uppercaseFirstLetterOfAllWords(name)}` : 'Add'}
      title={`Add ${Manager.isValid(name, true) ? StringManager.uppercaseFirstLetterOfAllWords(name) : 'Co-Parent'} to Your Profile`}
      wrapperClass="new-coparent-card"
      showCard={showCard}
      viewSelector={
        <ViewSelector
          defaultView={'New'}
          labels={['New', 'Link Existing Account']}
          updateState={(labelText) => {
            if (Manager.contains(labelText, 'New')) {
              setLinkOrNew('new')
            } else {
              setLinkOrNew('link')
            }
          }}
        />
      }
      onClose={ResetForm}>
      <div className="new-coparent-wrapper">
        <Spacer height={5} />
        <div id="new-coparent-container" className={`${theme} form`}>
          <div className="form new-coparent-form">
            {linkOrNew === 'new' && (
              <InputWrapper inputType={InputTypes.text} required={true} labelText={'Name'} onChange={(e) => setName(e.target.value)} />
            )}
            <InputWrapper
              inputType={InputTypes.email}
              inputValueType="email"
              required={true}
              labelText={'Email Address'}
              onChange={(e) => setEmail(e.target.value)}
            />
            {linkOrNew === 'new' && (
              <InputWrapper
                inputType={InputTypes.address}
                labelText={'Home Address'}
                onChange={(place) => {
                  setAddress(place)
                }}
              />
            )}

            <InputWrapper inputType={InputTypes.text} labelText={'Relationship to Me'} onChange={(e) => setRelationshipType(e.target.value)} />
            <Spacer height={5} />

            {/* PARENT TYPE */}
            <CheckboxGroup
              parentLabel={'Parent Type'}
              className="coparent-type"
              skipNameFormatting={true}
              checkboxArray={Manager.buildCheckboxGroup({
                currentUser,
                customLabelArray: ['Biological', 'Step-Parent', 'Guardian', 'Other'],
              })}
              onCheck={HandleCoparentType}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default NewCoparentForm