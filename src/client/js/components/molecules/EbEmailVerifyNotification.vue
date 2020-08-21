<template>
  <b-notification
    type="is-warning is-light"
    v-if="isActive"
    aria-close-label="Close notification"
    :closable="false"
    role="alert">
    {{ $t('msg["email is not verified"]') }}
  </b-notification>
</template>

<script>
export default {
  nane: 'EbEmailVerifyNotification',

  props: {
  },

  data(){
    return {
    }
  },

  computed: {
    isActive() {
      if (this.$store.state.auth.state === false) return false
      return this.$store.state.auth.user.emailVerified === false
    },
  },

  created() {
  },

  methods: {
  },
}
</script>

