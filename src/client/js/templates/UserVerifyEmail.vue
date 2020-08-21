<template>
<div>
  <h1 class="title">{{ $t('page.EmailVerification') }}</h1>
  <p
    v-if="resTitle"
    class="is-size-5"
  >{{ resTitle }}</h3>
  <p
    v-if="resBody"
  >{{ resBody }}</p>
</div>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/app';
import 'firebase/auth'
import utilUri from '@/util/uri'

export default {
  name: 'UserVerifyEmail',

  data () {
    return {
      resType: '',
      resTitle: '',
      resBody: '',
    }
  },

  computed: {
  },

  created: async function() {
    const auth = firebase.auth()
    const mode = utilUri.getParameterByName('mode')
    const actionCode = utilUri.getParameterByName('oobCode')
    const continueUrl = utilUri.getParameterByName('continueUrl')
    const lang = utilUri.getParameterByName('lang') || 'en'

    switch (mode) {
      //case 'resetPassword':
      //  // Display reset password handler and UI.
      //  handleResetPassword(auth, actionCode, continueUrl, lang)
      //  break;
      //case 'recoverEmail':
      //  // Display email recovery handler and UI.
      //  handleRecoverEmail(auth, actionCode, lang)
      //  break;
     case 'verifyEmail':
        const res = await this.handleVerifyEmail(auth, actionCode, continueUrl, lang)
        this.resType = res.type
        this.resTitle = res.title
        this.resBody = res.body
        break;
      default:
        // Error: invalid mode.
        this.showGlobalMessage(this.$t('msg["Invalid value"]'))
    }

    this.$store.dispatch('reloadUser')
  },

  methods: {
    handleVerifyEmail: function (auth, actionCode, continueUrl, lang) {
      // Localize the UI to the selected language as determined by the lang
      // parameter.
      return new Promise(async (resolve, reject) => {
        await auth.applyActionCode(actionCode).then((resp) => {
          const msg = {
            'title': this.$t('msg["Sign Up Completed"]'),
            'body': '',
            'type': 'success',
          }
          resolve(msg)
        }).catch((err) => {
          console.log(err)
          const msg = {
            'title': this.$t('msg["Verify Email Failed"]'),
            'body': this.$t('msg["Check verification email"]'),
            'type': 'error',
          }
          resolve(msg)
        })
      })
    }
  }
}
</script>

