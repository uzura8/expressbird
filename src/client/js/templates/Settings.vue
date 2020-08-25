<template>
<div>
  <h1 class="title">{{ $t('page.Settings') }}</h1>
  <div>
    <eb-edit-user-email></eb-edit-user-email>
  </div>
</div>
</template>

<script>
import EbEditUserEmail from '@/components/molecules/EbEditUserEmail'

export default{
  components: {
    EbEditUserEmail,
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
