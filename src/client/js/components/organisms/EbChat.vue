<template>
<div class="ebChat">
  <section class="comments-box" :class="{'is-auth': isAuth}" ref="commentsBox">
    <div v-if="comments">
      <nav v-if="existsNext && minId">
        <a class="u-clickable" @click="fetchComments({ maxId:minId }, true)">{{ $t('common.more') }}</a>
      </nav>
      <ul ref="commentList">
        <li v-for="item in comments"
          :key="item.id"
          class="">
          <div class="notification u-mt10"
            :class="{'is-info': item.userId == authUserId}">
            <div>
              <strong v-if="item.user && item.user.name != 'null'">{{ item.user.name }}</strong>
              <strong v-else>{{ $t('term.guestUser') }}</strong>
              <small class="u-ml05r">{{ item.createdAt | dateFormat('lll') }}</small>
            </div>
            <div class="is-size-5 u-mt5"
              v-html='usableTextEscaped(item.body)'></div>
          </div>
        </li>
      </ul>
    </div>
    <p v-else>{{ $t('msg["No Data"]') }}</p>
  </section>

  <eb-chat-comment-form
    v-if="isAuth"
    :chat-id="chatId"
    :is-include="isInclude" />

  <nav
    v-else-if="isEnabledFB"
    class="u-mt1r">
    <a @click="signInAnonymously"
      class="button is-text">{{ $t('msg["Comment as anonymous user"]') }}</a>
  </nav>

</div>
</template>

<script>
import Vue from 'vue'
import { Loading, Toast } from 'buefy'
Vue.use(Toast)
Vue.use(Loading)

import io from 'socket.io-client'
import EbChatCommentForm from '@/components/molecules/EbChatCommentForm'
import config from '@/config/config'

export default {
  nane: 'EbChat',

  components: {
    EbChatCommentForm,
  },

  props: {
    isInclude: {
      type: Boolean,
      default: false,
    },

    chatId: {
      type: Number,
      default: 0,
    },
  },

  data(){
    return {
      socket: io(),
    }
  },

  computed: {
    comments () {
      return this.$store.state.chatComment.list
    },

    minId () {
      return !this.isEmpty(this.comments) ? this.comments[0].id : 0
    },

    existsNext () {
      return this.$store.state.chatComment.nextId
    },

    isEnabledFB () {
      return config.firebase.isEnabled
    },
  },

  watch: {
    chatId: function (val) {
      this.resetComments()
    },
  },

  mounted() {
    if (config.domanin && config.port) {
      this.socket = io(`${config.domain}:${config.port}`)
    }
  },

  created() {
    this.resetComments()
  },

  updated() {
  },

  methods: {
    resetComments: function(params={}) {
      this.$store.dispatch('resetChatCommentList', this.chatId)
      this.fetchComments()
      this.scrollToEnd()
      this.socket.on(`CHAT_COMMENT_${this.chatId}`, (comment) => {
        this.$store.dispatch('addChatComment', comment)
        this.scrollToEnd()
      })
    },

    fetchComments: function(params={}, isNoScroll = false) {
      const payload = {
        chatId: this.chatId,
        params: params,
        token: this.authUserToken,
      }
      this.$store.dispatch('fetchChatComments', payload)
        .catch(err => {
          this.handleApiError(err, this.$t('msg["Failed to get data from server"]'))
        })
        .then(() => {
          if (!isNoScroll) this.scrollToEnd()
        })
    },

    signInAnonymously: function() {
      this.$store.dispatch('authenticateAnonymously')
        .then(() => {
          this.$store.dispatch('resetChatCommentList', this.chatId)
          this.fetchComments()
        })
        .catch(err => {
          this.showGlobalMessage(this.$t('msg["Sign Anonymously is failed"]'))
        })
    },

    scrollToEnd() {
      this.$nextTick(() => {
        if (this.isInclude && this.$refs.commentList != null) {
          const domRect = this.$refs.commentList.getBoundingClientRect()
          if (domRect.height != null) {
            this.$refs.commentsBox.scrollTop = domRect.height
          }
        } else {
          window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight)
        }

      })
    },
  },
}
</script>

<style lang="scss" scoped>
.ebChat {
  height: 100%;
}
.comments-box {
  height: 100%;
  padding-bottom: 0.5rem;
  overflow: auto;
  overflow-x: hidden;
}
</style>

