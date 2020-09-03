<template>
<div>
  <eb-edit-user-email></eb-edit-user-email>
  <eb-edit-user-password class="u-mt2r"></eb-edit-user-password>
  <eb-edit-user-name class="u-mt2r"></eb-edit-user-name>
</div>
</template>

<script>
import EbEditUserEmail from '@/components/molecules/EbEditUserEmail'
import EbEditUserPassword from '@/components/molecules/EbEditUserPassword'
import EbEditUserName from '@/components/molecules/EbEditUserName'

export default{
  name: 'EbSettingsContainer',

  components: {
    EbEditUserEmail,
    EbEditUserPassword,
    EbEditUserName,
  },

  data(){
    return {
    }
  },

  computed: {
  },

  created() {
  },

  methods: {
  },
}
</script>
