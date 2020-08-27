<template>
<div>
  <h1 class="title">{{ $t('page.Settings') }}</h1>
  <div>
    <eb-edit-user-email></eb-edit-user-email>
    <eb-edit-user-password class="u-mt2r"></eb-edit-user-password>
  </div>
</div>
</template>

<script>
import EbEditUserEmail from '@/components/molecules/EbEditUserEmail'
import EbEditUserPassword from '@/components/molecules/EbEditUserPassword'

export default{
  components: {
    EbEditUserEmail,
    EbEditUserPassword,
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
