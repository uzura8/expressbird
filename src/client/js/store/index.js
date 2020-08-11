import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'

Vue.use(Vuex)

const state = {
  common: {
    isLoading: false,
    isHeaderMenuOpen: false,
  },
  auth: {
    state: null,
    user: null,
    token: null,
  },
  chat: {},
  chatComment: {
    chatId: null,
    list: [],
    nextId: 0,
  },
  example: {
    list: [],
  },
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  plugins: [
    createPersistedState({
      key: 'GCState',
      paths: ['auth'],
      storage: window.sessionStorage
    })
  ],
  strict: process.env.NODE_ENV !== 'production'
})
