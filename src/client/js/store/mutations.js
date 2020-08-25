import * as types from './mutation-types'
import arr from '@/util/arr'

export default {
  [types.SET_COMMON_LOADING] (state, isLoading) {
    state.common.isLoading = isLoading
  },

  [types.AUTH_SET_USER] (state, payload) {
    state.auth.user = payload
  },

  [types.AUTH_UPDATE_USER_INFO] (state, payload) {
    const acceptKeys = ['id', 'name', 'email', 'emailVerified', 'type', 'uid', 'serviceCode']
    if (!arr.inArray(payload.key, acceptKeys)) new Error('Invalid  argument')
    state.auth.user[payload.key] = payload.value
  },

  [types.AUTH_SET_TOKEN] (state, payload) {
    state.auth.token = payload
  },

  [types.AUTH_UPDATE_STATE] (state, payload) {
    state.auth.state = payload
  },

  [types.SET_COMMON_HEADER_MENU_OPEN] (state, isOpen) {
    state.common.isHeaderMenuOpen = isOpen
  },

  [types.SET_CHAT] (state, payload) {
    state.chat = payload
  },

  [types.SET_CHAT_COMMENT_CHAT_ID] (state, payload) {
    state.chatComment.chatId = payload
  },

  [types.RESET_CHAT_COMMENT_LIST] (state) {
    state.chatComment.list = []
  },

  [types.FETCH_CHAT_COMMENT_LIST] (state, payload) {
    payload.map(item => {
      state.chatComment.list.unshift(item)
    })
  },

  [types.SET_CHAT_COMMENT_NEXT_ID] (state, payload) {
    state.chatComment.nextId = payload
  },

  [types.CREATE_CHAT_COMMENT] (state, payload) {
    //state.chatComment.list.push(payload)
  },

  [types.ADD_CHAT_COMMENT] (state, payload) {
    if (state.chatComment.chatId != payload.chatId) return
    const index = state.chatComment.list.findIndex(item => item.id === payload.id)
    if (index > -1) return
    state.chatComment.list.push(payload)
  },

  [types.DELETE_CHAT_COMMENT] (state, payload) {
    const id = payload.chatCommentId
    for (let i = 0, n = state.chatComment.list.length; i < n; i++) {
      const chatComment = state.chatComment.list[i]
      if (chatComment.id !== id) continue
      state.chatComment.list.splice(i, 1)
      break
    }
  },

  [types.FETCH_EXAMPLES_LIST] (state, payload) {
    state.example.list = payload
  },

  [types.CREATE_EXAMPLE] (state, payload) {
    state.example.list.push(payload)
  },

  [types.UPDATE_EXAMPLE] (state, payload) {
    const exampleId = payload.exampleId
    const values = payload.values
    const index = state.example.list.findIndex(item => item.id === exampleId)
    state.example.list.splice(index, 1, values)
  },

  [types.DELETE_EXAMPLE] (state, payload) {
    const id = payload.exampleId
    for (let i = 0, n = state.example.list.length; i < n; i++) {
      const example = state.example.list[i]
      if (example.id !== id) continue
      state.example.list.splice(i, 1)
      break
    }
  },
}
