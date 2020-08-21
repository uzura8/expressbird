import firebase from 'firebase/app'
import 'firebase/app';
import 'firebase/auth'
import siteUtil from '@/util/site'

export default {
  createUser: (vals) => {
    return new Promise((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(vals.email, vals.password)
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  authenticate: (params) => {
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(params.email, params.password)
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  authenticateAnonymously: () => {
    return new Promise((resolve, reject) => {
      firebase.auth().signInAnonymously()
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  checkAuth: () => {
    return new Promise((resolve, reject) => {
      try {
        firebase.auth().onAuthStateChanged(user => {
          resolve(user)
        })
      } catch (err) {
        reject(err)
      }
    });
  },

  getToken: (fbUser) => {
    return new Promise((resolve, reject) => {
      fbUser.getIdToken(true)
        .then(res => resolve(res))
        .catch(err => reject(err))
    });
  },

  sendEmailVerification: (fbUser, locationPath) => {
    const actionCodeSettings = {
      url: siteUtil.absUri(locationPath),
      handleCodeInApp: true,
    }
    return new Promise((resolve, reject) => {
      fbUser.sendEmailVerification(actionCodeSettings)
        .then(res => resolve(res))
        .catch(err => reject(err))
    });
  },

  signInWithEmailLink: (email, locationPath) => {
    const url = siteUtil.absUri(locationPath)
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailLink(email, url)
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  updateUserProfile: (fbUser, vals) => {
    return new Promise((resolve, reject) => {
      fbUser.updateProfile(vals)
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  userReload: (fbUser) => {
    return new Promise((resolve, reject) => {
      fbUser.reload()
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  googleAuthenticate: () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithPopup(provider)
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  signOut: () => {
    return new Promise((resolve, reject) => {
      firebase.auth().signOut()
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },
}
