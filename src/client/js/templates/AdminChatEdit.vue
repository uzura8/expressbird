<template>
<div class="chatEdit">
  <h1 class="title">{{ $t('common.edit') }}: {{ chat.name }}</h1>
  <eb-chat-form
    :chat-id="chatId"
    :is-use-admin="true"
    @loaded-chat="setChat" />
</div>
</template>

<script>
import EbChatForm from '@/components/organisms/EbChatForm'

export default {
  name: 'ChatEdit',

  components: {
    EbChatForm,
  },

  data () {
    return {
      chat: {},
    }
  },

  computed: {
    chatId () {
      return this.$route.params.id
    },
  },

  created: function() {
  },

  methods: {
    setChat: function(chat) {
      this.chat = chat
    },
  }
}
</script>

<style scoped>
</style>

