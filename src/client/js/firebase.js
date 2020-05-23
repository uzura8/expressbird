import firebase from 'firebase/app'
import 'firebase/app';
import 'firebase/auth'
import { SiteConfig } from '@/api/'

export default {
  init() {
    SiteConfig.get('firebase')
      .then(res => {
        const firebaseConfig = res
        firebase.initializeApp(firebaseConfig)
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      })
      .catch(err => {
        throw err
      })
  },
}
