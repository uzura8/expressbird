import store from '@/store'
import router from '@/router'
import listener from '@/listener'
import util from '@/util'
import config from '@/config/config'

export default {
  computed: {
    isFirebaseEnabled: function () {
      return config.firebase.isEnabled
    },

    isAuth: function () {
      return this.$store.state.auth.state
    },

    isAnonymous: function () {
      return this.$store.getters.checkUserType('anonymous')
    },

    isAdmin: function () {
      return this.$store.getters.checkUserType('admin')
    },

    isAdminPath: function () {
      return this.$route.path.startsWith('/admin')
    },

    authUserId: function () {
      return this.$store.state.auth.state ? this.$store.state.auth.user.id : 0
    },

    authUserToken: function () {
      return config.firebase.isEnabled ? this.$store.state.auth.token : null
    },
  },

  methods: {
    siteUri: util.site.uri,
    isEmpty: util.common.isEmpty,
    inArray: util.arr.inArray,
    listen: listener.listen,
    destroyed: listener.destroyed,

    showGlobalMessage: function(msg, type='is-danger', pos='is-bottom', duration=5000) {
      this.$buefy.toast.open({
        message: msg,
        type: type,
        duration: duration,
        position: pos,
      })
    },

    handleApiError: function(err, defaultMsg='') {
      if (err != null && err.response != null && err.response.status == 401) {
        store.dispatch('resetAuth')
        this.$router.push({
          path: '/signin',
          query: { redirect: this.$route.fullPath }
        })
      }
      if (typeof this.setErrors == 'function'
        && !this.isEmpty(err)
        && err.response != null
        && err.response.data != null
        && err.response.data.errors != null) {
        this.setErrors(err.response.data.errors)
      }
      if (err.response != null
        && err.response.data != null
        && err.response.data.message != null) {
        this.showGlobalMessage(err.response.data.message)
      } else if (defaultMsg) {
        this.showGlobalMessage(defaultMsg)
      } else {
        this.showGlobalMessage(this.$t('msg["Server error"]'))
      }
    },

    signOut: function () {
      store.dispatch('signOut')
        .then(() => {
          router.push({ path: '/signin' })
        })
        .catch(err => {
          this.handleApiError(err, this.$t('msg["Sign Out failed"]'))
        })
    },

    dispChatName: function (chatType, chat = {}, isAdmin = false) {
      if (chatType == 'support') {
        let name = this.$t('term["Support Chat"]')
        if (isAdmin) name += ` | userId: ${chat.userId}`
        return name
      } else if (chatType == 'public') {
        return chat.name != null && chat.name ?
          chat.name : this.$t('term["Group Chat"]')
      }
      return chat.name
    },

    usableTextSanitized: function (text) {
      let conved = util.str.nl2br(text)
      conved = util.str.url2link(conved)
      return this.$sanitize(conved)
    },

    usableTextEscaped: function (text) {
      let conved = util.str.escapeHtml(text)
      conved = util.str.nl2br(conved)
      return util.str.url2link(conved)
    },

    convUserTypeToi18n: function (userType) {
      switch (userType)
      {
        case 'admin':
          return this.$t('common.admin')
        case 'anonymous':
          return this.$t('common.anonymous')
      }
      return this.$t('common.normal')
    },
  },
}
