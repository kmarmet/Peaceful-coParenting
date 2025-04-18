import {getDatabase, off, onValue, ref} from 'firebase/database'
import {useContext, useEffect, useState} from 'react'
import Manager from '../../managers/manager'
import DB from '../../database/DB'
import globalState from '../../context'
import useUsers from './useUsers'
import useChatMessages from './useChatMessages'

const useChat = () => {
  const {state, setState} = useContext(globalState)
  const {messageRecipient, authUser} = state
  const {users} = useUsers()
  const [currentUser, setCurrentUser] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [path, setPath] = useState(`${DB.tables.chats}/${currentUser?.key}`)
  const queryKey = ['realtime', path]
  const [chat, setChat] = useState()
  const [chatId, setChatId] = useState(false)
  const {chatMessages} = useChatMessages(chatId)

  // Get current user and set path
  useEffect(() => {
    if (Manager.isValid(users)) {
      const user = users?.find((u) => u?.email === authUser?.email)
      setPath(`${DB.tables.chats}/${user?.key}`)
      setCurrentUser(user)
    }
  }, [users])

  useEffect(() => {
    const database = getDatabase()
    const dataRef = ref(database, path)

    const listener = onValue(
      dataRef,
      async (snapshot) => {
        const chats = snapshot.val()
        if (Manager.isValid(chats)) {
          for (let _chat of chats) {
            const memberKeys = _chat?.members?.map((x) => x?.key)
            if (Manager.isValid(memberKeys) && memberKeys.includes(messageRecipient?.key) && memberKeys.includes(currentUser?.key)) {
              setChatId(_chat?.id)
              setChat(_chat)
            }
          }
        } else {
          setChat(null)
        }
      },
      (err) => {
        console.log(`useChatMessages Error: ${err}`)
        setError(err)
        setIsLoading(false)
      }
    )

    return () => {
      off(dataRef, 'value', listener)
    }
  }, [path, currentUser, messageRecipient])

  return {
    chatMessages,
    chat,
    isLoading,
    error,
    queryKey,
  }
}

export default useChat