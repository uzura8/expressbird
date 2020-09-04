<template>
<div ref="appContainer" class="chat-container u-bg-tr" v-cloak>
  <b-loading :active="isLoading" :is-full-page="true" :canCancel="true"></b-loading>
  <div v-if="isActive" class="chat-widget">
    <div class="chat-widget-container" ref="chatWidgetContainer">
      <header class="chat-widget-header">

        <div class="tabs">
          <ul>
            <li :class="{ 'is-active': page === 'supportChat' }">
              <a @click="changeTab('supportChat')" v-text="dispChatName('support', chat)"></a>
            </li>
            <li :class="{ 'is-active': page === 'groupChat' }">
              <a @click="changeTab('groupChat')" v-text="dispChatName('public')"></a>
            </li>
            <li 
              v-if="isAnonymous"
              :class="{ 'is-active': page === 'signUp' }"
            >
              <a @click="changeTab('signUp')">{{ this.$t('common.signUp') }}</a>
            </li>
            <li 
              v-else-if="isAuth"
              :class="{ 'is-active': page === 'settings' }"
            >
              <a @click="changeTab('settings')">{{ this.$t('page.Settings') }}</a>
            </li>
          </ul>

          <a @click="isActive = !isActive"
            class="button is-white u-bg-tr">
            <i class="fas fa-times"></i>
          </a>
        </div>
      </header>

      <eb-sign-up-form
        v-if="page === 'signUp'"
        :is-include="true"
        @email-signup-complete="executeOnSignedUpEmail"
        @oauth-signup-complete="executeOnSignedUpOAuth"
        class="u-mt3r"
      ></eb-sign-up-form>

      <eb-settings-container
        v-else-if="page === 'settings'"
        class="u-mt3r"
      ></eb-settings-container>

      <eb-chat
        v-else
        :isInclude="true"
        :chatId="chatId"
        @loaded-chat="setChat"></eb-chat>
    </div>
  </div>
  <div v-else
    class="chat-widget-btn-container">
    <button @click="chatOpen"
      class="button is-primary is-medium is-rounded btn-chat-window">
      <span class="icon is-large">
        <i class="fas fa-comment"></i>
      </span>
    </button>
  </div>
</div>
</template>

<script>
import EbChat from '@/components/organisms/EbChat'
import EbSignUpForm from '@/components/organisms/EbSignUpForm'
import EbSettingsContainer from '@/components/organisms/EbSettingsContainer'
import { Chat } from '@/api/'

export default {
  name: 'AppiIncluded',
  components: {
    EbChat,
    EbSignUpForm,
    EbSettingsContainer,
  },

  data(){
    return {
      isActive: false,
      page: 'supportChat',
      chat: {},
    }
  },

  computed: {
    isLoading () {
      return this.$store.state.common.isLoading
    },

    chatId () {
      return this.chat.id
    },

    appContainerSize () {
      return {
        width: this.$refs.appContainer.clientWidth,
        height: this.$refs.appContainer.clientHeight,
      }
    },
  },

  watch: {
    isActive: function (val) {
      if (typeof window.parent.postMessage === undefined) return
      //const origin = site.baseUri('origin')
      window.parent.postMessage({ chatActive: val }, '*');
    },
  },

  created() {
    if (this.isAuth) this.$store.dispatch('reloadUser')
  },

  methods: {
    chatOpen: function() {
      if (!this.chatId) {
        this.activate()
      } else {
        this.isActive = true
      }
    },

    changeTab: function(page) {
      this.page = page

      if (page != 'settings') {
        this.setChat()
      }
    },

    activate: function() {
      if (! this.isAuth) {
        this.signInAnonymously()
      } else {
        this.setChat()
      }
    },

    signInAnonymously: function() {
      this.$store.dispatch('authenticateAnonymously')
        .then(() => {
          this.setChat()
        })
        .catch(err => {
          this.handleApiError(err, this.$t('msg["Sign Anonymously is failed"]'))
        })
    },

    setChat: function() {
      if (this.page === 'groupChat') {
        this.setPublicChat()
      } else if (this.page === 'supportChat') {
        this.setSupportChat()
      }
    },

    setPublicChat: function() {
      Chat.getPublic()
        .then(res => {
          if (!this.isEmpty(res)) {
            this.chat = res[0]
            this.isActive = true
          } else {
            this.handleApiError(err, this.$t('msg["Data is empty"]'))
          }
        })
        .catch(err => {
          this.handleApiError(err, this.$t('msg["Failed to get data from server"]'))
        })
    },

    setSupportChat: function() {
      Chat.getByUserId(this.authUserId, this.authUserToken, 'support')
        .then(res => {
          if (!this.isEmpty(res)) {
            this.chat = res[0]
            this.isActive = true
          } else {
            this.assignSupportChat()
          }
        })
        .catch(err => {
          this.handleApiError(err, this.$t('msg["Failed to get data from server"]'))
        })
    },

    assignSupportChat: function() {
      Chat.assignSupportChat(this.authUserId, this.authUserToken)
        .then(res => {
          this.chat = res[0]
          this.isActive = true
        })
        .catch(err => {
          this.handleApiError(err, this.$t('msg["Failed to get data from server"]'))
        })
    },

    executeOnSignedUpEmail: function() {
      this.changeTab('supportChat')
      this.showGlobalMessage(this.$t('msg["Sent verification email"]'), 'is-success')
    },

    executeOnSignedUpOAuth: function() {
      this.changeTab('supportChat')
      this.showGlobalMessage(this.$t('msg["Sign Up Completed"]'), 'is-success')
    },
  },
}
</script>

<style lang="scss" scoped>
.chat-container {
  margin: 0 10px 10px;
  padding: 0 10px 10px 0;
  background-color: transparent;
  height: 100%;
  overflow: hidden;
}
.chat-widget {
  background-color: #fff;
  padding: 60px 1rem 80px;
  height: 100%;
  border: solid 1px #DBDBDB;
  box-shadow: 5px 10px 5px rgba(0, 0, 0, 0.4);
}
.chat-widget-btn-container {
  padding-top: 10px;
}
.chat-widget-container {
  background-color: #fff;
  height: 100%;
  margin: 0 auto;
}
.chat-widget-header {
  margin: 0 10px;
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100% - 30px);
  height: 60px;
  margin: 1 -1.5rem 0;
  background-color: #fff;
  padding: 1rem 0.5rem;
  border-top: solid 1px #DBDBDB;
  border-right: solid 1px #DBDBDB;
  border-left: solid 1px #DBDBDB;

  .tabs {
    position: relative;

    .button {
      position: absolute;
      right: 0;
    }
  }

  h3 {
    padding-left: 0.5rem;

    .button {
      padding-right: 0.5rem;
    }
  }
}
</style>


