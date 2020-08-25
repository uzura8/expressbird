<template>
<div>
  <eb-admin-navbar v-if="isAdminPath" />
  <eb-navbar v-else />
  <div class="container" v-cloak>
    <main class="section">
      <b-loading :active="isLoading" :is-full-page="true" :canCancel="true"></b-loading>
      <eb-email-verify-notification></eb-email-verify-notification>
      <router-view></router-view>
    </main>
  </div>
</div>
</template>

<script>
import EbNavbar from '@/components/organisms/EbNavbar'
import EbAdminNavbar from '@/components/organisms/EbAdminNavbar'
import EbEmailVerifyNotification from '@/components/molecules/EbEmailVerifyNotification'

export default {
  name: 'App',

  components: {
    EbNavbar,
    EbAdminNavbar,
    EbEmailVerifyNotification,
  },

  computed: {
    isLoading () {
      return this.$store.state.common.isLoading
    },
  },

  created: function () {
    if (this.isAuth) this.$store.dispatch('reloadUser')
  },

  methods: {
  },
}
</script>
