<template>
<div>
  <h1 class="title">{{ $t('page.Settings') }}</h1>
  <div>
    <eb-edit-user-email></eb-edit-user-email>
    <eb-edit-user-password class="u-mt2r"></eb-edit-user-password>
    <eb-edit-user-name class="u-mt2r"></eb-edit-user-name>
  </div>
</div>
</template>

<script>
import EbEditUserEmail from '@/components/molecules/EbEditUserEmail'
import EbEditUserPassword from '@/components/molecules/EbEditUserPassword'
import EbEditUserName from '@/components/molecules/EbEditUserName'

export default{
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
