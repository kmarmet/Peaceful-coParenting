import React, {useContext, useEffect, useState} from 'react'
import Modal from '../shared/modal'
import CreationForms from '../../constants/creationForms'
import Manager from '../../managers/manager'
import StringManager from '../../managers/stringManager'
import globalState from '../../context'
import DB_UserScoped from '../../database/db_userScoped'
import {FaUserCircle} from 'react-icons/fa'
import AlertManager from '../../managers/alertManager'
import ScreenNames from '../../constants/screenNames'
import SecurityManager from '../../managers/securityManager'
import {BiMessageRoundedAdd} from 'react-icons/bi'
import Spacer from '../shared/spacer'

const NewChatSelector = () => {
  const {state, setState} = useContext(globalState)
  const {currentUser, creationFormToShow} = state
  const [activeChatKeys, setActiveChatKeys] = useState([])

  const getSecuredChats = async () => {
    let securedChats = await SecurityManager.getChats(currentUser)
    const members = securedChats.map((x) => x.members).flat()
    const activeChats = members.filter((x) => x?.key && x?.key !== currentUser?.key)
    const activeChatKeys = activeChats.map((x) => x?.key)
    setActiveChatKeys(activeChatKeys)
  }

  const openMessageThread = async (coparent) => {
    // Check if thread member (coparent) profile exists in DB
    let userCoparent = await DB_UserScoped.getCoparentByKey(coparent?.key, currentUser)
    if (!Manager.isValid(userCoparent)) {
      AlertManager.oneButtonAlert(
        'Co-Parent or Child Profile not Found',
        'This co-parent may have closed their profile, however, you can still view the messages',
        null,
        () => {
          setState({...state, currentScreen: ScreenNames.chats, messageRecipient: coparent})
        }
      )
    } else {
      setState({...state, currentScreen: ScreenNames.chat, messageRecipient: userCoparent, showCreationMenu: false, creationFormToShow: null})
    }
  }

  useEffect(() => {
    if (Manager.isValid(currentUser) && creationFormToShow === CreationForms.chat) {
      getSecuredChats().then((r) => r)
    }
  }, [creationFormToShow])

  return (
    <Modal
      hasSubmitButton={false}
      className="new-chat"
      wrapperClass="new-chat"
      onClose={() => setState({...state, showCreationMenu: false, creationFormToShow: null, refreshKey: Manager.getUid()})}
      showCard={creationFormToShow === CreationForms.chat}
      title={`${activeChatKeys.length === currentUser?.coparents?.length ? 'Unable to Create Chat' : 'Create Chat'}`}>
      <Spacer height={5} />
      {activeChatKeys.length === currentUser?.coparents?.length && (
        <>
          <p id="max-chats-text">You already have an existing chat with all children and/or co-parents</p>
          <Spacer height={5} />
        </>
      )}
      {/* COPARENTS */}
      {currentUser?.accountType === 'parent' &&
        Manager.isValid(currentUser?.coparents) &&
        currentUser?.coparents?.map((coparent, index) => {
          return (
            <div key={index}>
              {!activeChatKeys.includes(coparent?.key) && (
                <div id="currentUser-wrapper">
                  <div className="user-wrapper">
                    <FaUserCircle />
                    <p
                      className="coparent-name new-thread-coparent-name"
                      onClick={() => {
                        openMessageThread(coparent).then((r) => r)
                      }}>
                      {StringManager.getFirstNameOnly(coparent?.name)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}

      {/* CHILDREN */}
      {currentUser?.accountType === 'child' &&
        Manager.isValid(currentUser?.parents) &&
        currentUser?.parents
          ?.filter((x) => x)
          .map((parent, index) => {
            return (
              <div key={index} className="flex" id="currentUser-wrapper">
                {!activeChatKeys.includes(parent?.key) && (
                  <div className="user-wrapper">
                    <BiMessageRoundedAdd />
                    <p
                      className="coparent-name new-thread-coparent-name"
                      onClick={() => {
                        openMessageThread(parent?.key).then((r) => r)
                      }}>
                      {parent?.name}
                    </p>
                  </div>
                )}
                {activeChatKeys.includes(parent?.key) && <p>All available parents already have an open conversation with you. </p>}
              </div>
            )
          })}
    </Modal>
  )
}

export default NewChatSelector