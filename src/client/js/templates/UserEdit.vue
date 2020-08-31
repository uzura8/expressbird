<template>
<div>
  <h1 class="title">{{ $t('page.editUser') }}</h1>
  <user-edit-form :userId="$route.params.id"></user-edit-form>
</div>
</template>

<script>
import UserEditForm from '@/components/organisms/UserEditForm'

export default {
  name: 'SignUp',

  components: {
    UserEditForm
  },

  data () {
    return {
    }
  },

  computed: {
  },

  created: function() {
  },

  methods: {
  }
}
</script>

