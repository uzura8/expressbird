import * as types from './mutation-types'
import { Example, Admin, User, Chat, ChatComment, Firebase } from '@/api'
import config from '@/config/config'
import firebase from 'firebase/app'
import 'firebase/app';
import 'firebase/auth'

const isEnabledFB = config.firebase.isEnabled

export default {
  setHeaderMenuOpen: ({ commit }, isOpen) => {
    commit(types.SET_COMMON_HEADER_MENU_OPEN, isOpen)
  },

  setLoading: ({ commit }, isLoading) => {
    commit(types.SET_COMMON_LOADING, isLoading)
  },

  setAuth: ({ commit }, user) => {
    commit(types.AUTH_SET_USER, user)
    commit(types.AUTH_UPDATE_STATE, true)
  },

  authenticate: async ({ commit }, payload) => {
    commit(types.SET_COMMON_LOADING, true)
    if (isEnabledFB) {
      try {
        const res = await Firebase.authenticate(payload)
        const idToken = await Firebase.getToken(res.user)
        const serviceUser = await User.getServiceUser('firebase', res.user.uid, idToken)
        const user = {
          id: serviceUser.id,
          uid: res.user.uid,
          name: res.user.displayName,
          emailVerified: res.user.emailVerified,
          type: serviceUser.type,
          email: res.user.email,
          serviceCode: 'firebase',
        }
        commit(types.AUTH_SET_USER, user)
        commit(types.AUTH_SET_TOKEN, idToken)
        commit(types.AUTH_UPDATE_STATE, true)
        commit(types.SET_COMMON_LOADING, false)
      } catch (error) {
        commit(types.AUTH_SET_USER, null)
        commit(types.AUTH_SET_TOKEN, null)
        commit(types.AUTH_UPDATE_STATE, false)
        commit(types.SET_COMMON_LOADING, false)
        throw error
      }
    } else {
      try {
        const user = User.authenticate(payload)
        commit(types.AUTH_SET_USER, user)
        commit(types.AUTH_UPDATE_STATE, true)
        commit(types.SET_COMMON_LOADING, false)
      } catch (error) {
        commit(types.AUTH_SET_USER, null)
        commit(types.AUTH_SET_TOKEN, null)
        commit(types.AUTH_UPDATE_STATE, false)
        commit(types.SET_COMMON_LOADING, false)
        throw error
      }
    }
  },

  authenticateWithOAuth: async ({ commit }, providerName) => {
    commit(types.SET_COMMON_LOADING, true)
    try {
      let provider
      switch (providerName) {
        case 'google.com':
          provider = new firebase.auth.GoogleAuthProvider()
          break
        //case 'twitter.com':
        //  provider = new firebase.auth.TwitterAuthProvider()
        //  break
        //case 'facebook.com':
        //  provider = new firebase.auth.FacebookAuthProvider()
        //  break
      }

      const res = await firebase.auth().signInWithPopup(provider)
      //const accessToken = res.credential.accessToken
      const idToken = await Firebase.getToken(res.user)
      const vals = {
        name: res.user.displayName,
        type: 'normal',
      }
      const serviceUser = await User.createServiceUser('firebase', res.user.uid, vals)
      const user = {
        id: serviceUser.id,
        uid: res.user.uid,
        name: res.user.displayName,
        emailVerified: res.user.emailVerified,
        type: serviceUser.type,
        email: res.user.email,
        serviceCode: 'firebase',
      }
      commit(types.AUTH_SET_USER, user)
      commit(types.AUTH_SET_TOKEN, idToken)
      commit(types.AUTH_UPDATE_STATE, true)
      commit(types.SET_COMMON_LOADING, false)
    } catch (error) {
      commit(types.AUTH_SET_USER, null)
      commit(types.AUTH_SET_TOKEN, null)
      commit(types.AUTH_UPDATE_STATE, false)
      commit(types.SET_COMMON_LOADING, false)
      throw error
    }
  },

  authenticateAnonymously: async ({ commit }, payload) => {
    commit(types.SET_COMMON_LOADING, true)
    if (isEnabledFB) {
      try {
        const res = await Firebase.authenticateAnonymously(payload)
        const vals = {
          name: res.user.displayName,
          type: 'anonymous',
        }
        const idToken = await Firebase.getToken(res.user)
        const serviceUser = await User.createServiceUser('firebase', res.user.uid, vals)
        const user = {
          id: serviceUser.id,
          email: res.user.email,
          name: res.user.displayName,
          emailVerified: res.user.emailVerified,
          type: 'anonymous',
          uid: res.user.uid,
          serviceCode: 'firebase',
        }
        commit(types.AUTH_SET_USER, user)
        commit(types.AUTH_SET_TOKEN, idToken)
        commit(types.AUTH_UPDATE_STATE, true)
        commit(types.SET_COMMON_LOADING, false)
      } catch (error) {
        commit(types.AUTH_SET_USER, null)
        commit(types.AUTH_SET_TOKEN, null)
        commit(types.AUTH_UPDATE_STATE, false)
        commit(types.SET_COMMON_LOADING, false)
        throw error
      }
    } else {
      // TODO: Implemented not to use firebase
    }
  },

  checkAuthenticate: async ({ commit }) => {
    commit(types.SET_COMMON_LOADING, true)
    if (isEnabledFB) {
      try {
        const fbuser = await Firebase.checkAuth()
        if (fbuser) {
          const idToken = await Firebase.getToken(fbuser)
          const serviceUser = await User.getServiceUser('firebase', fbuser.uid, idToken)
          const user = {
            id: serviceUser.id,
            email: fbuser.email,
            name: fbuser.displayName,
            emailVerified: fbuser.emailVerified,
            type: serviceUser.type,
            uid: fbuser.uid,
            serviceCode: 'firebase',
          }
          commit(types.SET_COMMON_LOADING, false)
          commit(types.AUTH_SET_USER, user)
          commit(types.AUTH_SET_TOKEN, idToken)
          commit(types.AUTH_UPDATE_STATE, true)
        } else {
          commit(types.SET_COMMON_LOADING, false)
        }
      } catch (error) {
        commit(types.AUTH_SET_USER, null)
        commit(types.AUTH_SET_TOKEN, null)
        commit(types.AUTH_UPDATE_STATE, false)
        commit(types.SET_COMMON_LOADING, false)
        throw error
      }
    } else {
      try {
        const user = await User.check()
        commit(types.AUTH_SET_USER, user)
        commit(types.AUTH_UPDATE_STATE, true)
        commit(types.SET_COMMON_LOADING, false)
      } catch (error) {
        commit(types.AUTH_SET_USER, null)
        commit(types.AUTH_SET_TOKEN, null)
        commit(types.AUTH_UPDATE_STATE, false)
        commit(types.SET_COMMON_LOADING, false)
        throw error
      }
    }
  },

  reloadUser: async ({ commit }) => {
    commit(types.SET_COMMON_LOADING, true)
    try {
      const fbuser = await Firebase.checkAuth()
      if (fbuser) {
        await Firebase.userReload(fbuser)
        const idToken = await Firebase.getToken(fbuser)
        const serviceUser = await User.getServiceUser('firebase', fbuser.uid, idToken)
        const user = {
          id: serviceUser.id,
          email: fbuser.email,
          name: fbuser.displayName,
          emailVerified: fbuser.emailVerified,
          type: serviceUser.type,
          uid: fbuser.uid,
          serviceCode: 'firebase',
        }
        commit(types.SET_COMMON_LOADING, false)
        commit(types.AUTH_SET_USER, user)
        commit(types.AUTH_SET_TOKEN, idToken)
        commit(types.AUTH_UPDATE_STATE, true)
      } else {
        commit(types.SET_COMMON_LOADING, false)
      }
    } catch (error) {
      commit(types.AUTH_SET_USER, null)
      commit(types.AUTH_SET_TOKEN, null)
      commit(types.AUTH_UPDATE_STATE, false)
      commit(types.SET_COMMON_LOADING, false)
      throw error
    }
  },

  createUser: async ({ commit }, vals) => {
    commit(types.SET_COMMON_LOADING, true)
    if (isEnabledFB) {
      try {
        let res = await Firebase.createUser(vals)
        const uid = res.user.uid
        await Firebase.updateUserProfile(res.user, {displayName: vals.name})
        const idToken = await Firebase.getToken(res.user)
        const serviceUserVal = { uid:uid, name:vals.name }
        const serviceUser = await User.createServiceUser('firebase', uid, serviceUserVal, idToken)
        const user = {
          id: serviceUser.id,
          name: serviceUser.name,
          email: res.user.email,
          emailVerified: res.user.emailVerified,
          type: serviceUser.type,
          uid: uid,
          serviceCode: 'firebase',
        }
        commit(types.AUTH_SET_USER, user)
        commit(types.AUTH_SET_TOKEN, idToken)
        commit(types.AUTH_UPDATE_STATE, true)
        commit(types.SET_COMMON_LOADING, false)
      } catch (err) {
        commit(types.AUTH_SET_USER, null)
        commit(types.AUTH_SET_TOKEN, null)
        commit(types.AUTH_UPDATE_STATE, false)
        commit(types.SET_COMMON_LOADING, false)
        throw err
      }
    } else {
      try {
        const user = await User.create(vals)
        commit(types.AUTH_SET_USER, user)
        commit(types.AUTH_UPDATE_STATE, true)
        commit(types.SET_COMMON_LOADING, false)
      } catch (err) {
        commit(types.AUTH_SET_USER, null)
        commit(types.AUTH_SET_TOKEN, null)
        commit(types.AUTH_UPDATE_STATE, false)
        commit(types.SET_COMMON_LOADING, false)
        throw err
      }
    }
  },

  editUserByAdmin: async ({ commit, state }, payload) => {
    commit(types.SET_COMMON_LOADING, true)
    try {
      const userVals = {
        email: payload.email,
        password: payload.password,
        name: payload.name,
        type: payload.type,
      }
      if (payload.id == null) {
        await Admin.createUser('firebase', userVals, state.auth.token)
      } else {
        await Admin.editUser(payload.id, 'firebase', userVals, state.auth.token)
      }
      commit(types.SET_COMMON_LOADING, false)
    } catch (err) {
      commit(types.SET_COMMON_LOADING, false)
      throw err
    }
  },

  editUserProfile: async ({ commit, state }, payload) => {
    commit(types.SET_COMMON_LOADING, true)
    try {
      if (payload.vals.name != null) {
        const user = firebase.auth().currentUser;
        await user.updateProfile({
          displayName: payload.vals.name,
        })
      }
      await User.edit(payload.id, payload.vals, state.auth.token)
      Object.keys(payload.vals).map(key => {
        commit(types.AUTH_UPDATE_USER_INFO, { key:key, value:payload.vals[key] })
      })
      commit(types.SET_COMMON_LOADING, false)
    } catch (err) {
      commit(types.SET_COMMON_LOADING, false)
      throw err
    }
  },

  createUserWithEmailSend: async ({ commit }, vals) => {
    commit(types.SET_COMMON_LOADING, true)
    commit(types.AUTH_SET_USER, null)
    commit(types.AUTH_SET_TOKEN, null)
    commit(types.AUTH_UPDATE_STATE, false)
    try {
      let res = await Firebase.createUser(vals)
      const uid = res.user.uid
      await Firebase.updateUserProfile(res.user, {displayName: vals.name})
      const idToken = await Firebase.getToken(res.user)
      const serviceUserVal = { uid:uid, name:vals.name }
      await User.createServiceUser('firebase', uid, serviceUserVal, idToken)
      await Firebase.sendEmailVerification(res.user, 'user/verify-email')
      commit(types.SET_COMMON_LOADING, false)
    } catch (err) {
      console.log(err)
      commit(types.SET_COMMON_LOADING, false)
      throw err
    }
  },

  linkUserWithCredentialOnEmailAuth: async ({ commit, state }, vals) => {
    commit(types.SET_COMMON_LOADING, true)
    try {
      const credential = await firebase.auth.EmailAuthProvider.credential(vals.email, vals.password);
      const res = await firebase.auth().currentUser.linkWithCredential(credential);
      const fbuser = res.user
      await Firebase.updateUserProfile(fbuser, {displayName: vals.name})
      const idToken = await Firebase.getToken(fbuser)
      const user = await User.edit(state.auth.user.id, { name:vals.name, type:'normal' }, idToken)
      await Firebase.sendEmailVerification(res.user, 'user/verify-email')
      const stateUser = {
        id: user.id,
        email: fbuser.email,
        name: fbuser.displayName,
        emailVerified: fbuser.emailVerified,
        type: user.type,
        uid: fbuser.uid,
        serviceCode: 'firebase',
      }
      commit(types.AUTH_SET_USER, stateUser)
      commit(types.AUTH_SET_TOKEN, idToken)
      commit(types.AUTH_UPDATE_STATE, true)
      commit(types.SET_COMMON_LOADING, false)
    } catch (err) {
      console.log(err)
      commit(types.SET_COMMON_LOADING, false)
      throw err
    }
  },

  linkUserWithCredentialOnOAuth: async ({ commit, state }, providerName) => {
    commit(types.SET_COMMON_LOADING, true)
    try {
      let provider
      switch (providerName) {
        case 'google.com':
          provider = new firebase.auth.GoogleAuthProvider()
          break
        //case 'twitter.com':
        //  provider = new firebase.auth.TwitterAuthProvider()
        //  break
        //case 'facebook.com':
        //  provider = new firebase.auth.FacebookAuthProvider()
        //  break
      }
      const res = await firebase.auth().currentUser.linkWithPopup(provider)
      const fbuser = res.user

      let val = { type:'normal' }
      if (fbuser.displayName != null) val.name = fbuser.displayName
      const idToken = await Firebase.getToken(fbuser)
      const user = await User.edit(state.auth.user.id, val, idToken)

      const stateUser = {
        id: user.id,
        email: fbuser.email,
        name: fbuser.displayName,
        emailVerified: fbuser.emailVerified,
        type: user.type,
        uid: fbuser.uid,
        serviceCode: 'firebase',
      }
      commit(types.AUTH_SET_USER, stateUser)
      commit(types.AUTH_SET_TOKEN, idToken)
      commit(types.AUTH_UPDATE_STATE, true)
      commit(types.SET_COMMON_LOADING, false)
    } catch (err) {
      console.log(err)
      commit(types.SET_COMMON_LOADING, false)
      throw err
    }
  },

  changeEmail: async ({ commit }, email) => {
    commit(types.SET_COMMON_LOADING, true)
    try {
      const fbuser = await Firebase.checkAuth()
      if (!fbuser) throw new Error('require to auth')
      await Firebase.updateEmail(fbuser, email)// Update email
      const token = await Firebase.getToken(fbuser)// Update token
      await Firebase.sendEmailVerification(fbuser, 'user/verify-email')
      commit(types.AUTH_SET_TOKEN, token)
      commit(types.AUTH_UPDATE_USER_INFO, { key:'email', value:email })
      commit(types.AUTH_UPDATE_USER_INFO, { key:'emailVerified', value:false })
      commit(types.SET_COMMON_LOADING, false)
    } catch (error) {
      commit(types.SET_COMMON_LOADING, false)
      throw error
    }
  },

  changePassword: async ({ commit, state }, vals) => {
    commit(types.SET_COMMON_LOADING, true)
    try {
      const user = await firebase.auth().currentUser
      if (state.auth.user.type !== 'anonymous') {
        const cred = await firebase.auth.EmailAuthProvider.credential(user.email, vals.passwordOld)
        await user.reauthenticateAndRetrieveDataWithCredential(cred);
      }
      await user.updatePassword(vals.passwordNew)
      const token = await Firebase.getToken(user)// Update token
      commit(types.AUTH_SET_TOKEN, token)
      commit(types.SET_COMMON_LOADING, false)
    } catch (error) {
      commit(types.SET_COMMON_LOADING, false)
      throw error
    }
  },

  signInWithEmailLink: async ({ commit }, payload) => {
    commit(types.SET_COMMON_LOADING, true)
    try {
      const res = await Firebase.signInWithEmailLink(payload.email, payload.path)
      const idToken = await Firebase.getToken(res.user)
      const serviceUser = await User.getServiceUser('firebase', res.user.uid, idToken)
      const user = {
        id: serviceUser.id,
        uid: res.user.uid,
        name: res.user.displayName,
        emailVerified: res.user.emailVerified,
        type: serviceUser.type,
        email: res.user.email,
        serviceCode: 'firebase',
      }
      commit(types.AUTH_SET_USER, user)
      commit(types.AUTH_SET_TOKEN, idToken)
      commit(types.AUTH_UPDATE_STATE, true)
      commit(types.SET_COMMON_LOADING, false)
    } catch (error) {
      commit(types.AUTH_SET_USER, null)
      commit(types.AUTH_SET_TOKEN, null)
      commit(types.AUTH_UPDATE_STATE, false)
      commit(types.SET_COMMON_LOADING, false)
      throw error
    }
  },

  signOut: ({ commit }) => {
    commit(types.SET_COMMON_LOADING, true)
    if (isEnabledFB) {
      return Firebase.signOut()
        .then(() => {
          commit(types.AUTH_SET_USER, null)
          commit(types.AUTH_SET_TOKEN, null)
          commit(types.AUTH_UPDATE_STATE, false)
          commit(types.SET_COMMON_LOADING, false)
        })
        .catch(err => {
          commit(types.SET_COMMON_LOADING, false)
          throw err
        })
    } else {
      return User.signOut()
        .then(() => {
          commit(types.AUTH_SET_USER, null)
          commit(types.AUTH_SET_TOKEN, null)
          commit(types.AUTH_UPDATE_STATE, false)
          commit(types.SET_COMMON_LOADING, false)
        })
        .catch(error => {
          commit(types.SET_COMMON_LOADING, false)
          throw error
        })
    }
  },

  resetAuth: ({ commit }) => {
    commit(types.AUTH_SET_USER, null)
    commit(types.AUTH_SET_TOKEN, null)
    commit(types.AUTH_UPDATE_STATE, false)
  },

  setIsLoading: ({ commit }, isLoading) => {
    commit(types.SET_COMMON_LOADING, isLoading)
  },

  setChat: ({ commit }, payload) => {
    commit(types.SET_COMMON_LOADING, true)
    return Chat.get(payload.chatId, payload.token)
      .then(res => {
        commit(types.SET_CHAT, res)
        commit(types.SET_COMMON_LOADING, false)
      })
      .catch(err => {
        commit(types.SET_COMMON_LOADING, false)
        throw err
      })
  },

  setChatCommentChatId: ({ commit }, chatId) => {
    commit(types.SET_CHAT_COMMENT_CHAT_ID, chatId)
  },

  resetChatCommentList: ({ commit }, chatId) => {
    commit(types.SET_CHAT_COMMENT_CHAT_ID, chatId)
    commit(types.RESET_CHAT_COMMENT_LIST)
  },

  fetchChatComments: ({ commit }, payload) => {
    commit(types.SET_COMMON_LOADING, true)
    return ChatComment.fetch(payload.chatId, payload.params, payload.token)
      .then(({ res }) => {
        commit(types.FETCH_CHAT_COMMENT_LIST, res.comments)
        commit(types.SET_CHAT_COMMENT_NEXT_ID, res.nextId)
        commit(types.SET_COMMON_LOADING, false)
      })
      .catch(err => {
        commit(types.SET_COMMON_LOADING, false)
        throw err
      })
  },

  createChatComment: ({ commit }, payload) => {
    return ChatComment.create(payload.chatId, payload.vals, payload.token)
      .then((item) => {
        commit(types.CREATE_CHAT_COMMENT, item)
      })
      .catch(err => { throw err })
  },

  addChatComment: ({ commit }, payload) => {
    commit(types.ADD_CHAT_COMMENT, payload)
  },

  createExample: ({ commit }, payload) => {
    return Example.create(payload)
      .then((item) => {
        commit(types.CREATE_EXAMPLE, item)
      })
      .catch(err => { throw err })
  },

  updateExample: ({ commit }, payload) => {
    return Example.update(payload.exampleId, payload.values)
      .then((item) => {
        commit(types.UPDATE_EXAMPLE, {
          exampleId: payload.exampleId,
          values: item,
        })
      })
      .catch(err => { throw err })
  },

  deleteExample: ({ commit }, presetId) => {
    return Example.delete(presetId)
      .then((item) => {
        const data = {
          exampleId: presetId,
          values: item,
        }
        commit(types.DELETE_EXAMPLE, data)
      })
      .catch(err => { throw err })
  },
}

