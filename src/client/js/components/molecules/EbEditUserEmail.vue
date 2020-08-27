<template>
<div class="field is-horizontal">
  <div class="field-label is-normal" v-if="dispLabel">
    <label class="label">{{ $t('common.email') }}</label>
  </div>
  <div class="field-body">
    <div v-if="isEdit">
      <div class="field is-grouped">
        <div class="control has-icons-left has-icons-right is-expanded">
          <input
            class="input"
            :class="{'is-danger': errorMsg}"
            type="email"
            :placeholder="$t('common.email')"
            v-model="email"
            @blur="validate"
          >
          <span class="icon is-small is-left">
            <i class="fas fa-envelope"></i>
          </span>
          <span
            v-if="errorMsg"
            class="icon is-small is-right "
          >
            <i
              class="fas fa-exclamation-triangle"
              :class="{'has-text-danger': errorMsg}"
            ></i>
          </span>
        </div>
        <div class="control">
          <a class="button is-info" @click="edit">{{ $t('common.edit') }}</a>
          <a class="button" @click="cancel">{{ $t('common.cancel') }}</a>
        </div>
      </div>
      <p class="help is-danger" v-if="errorMsg">{{ errorMsg }}</p>
    </div>

    <div class="field" v-else>
      <span>{{ $store.getters.userInfo('email') }}</span>
      <a class="is-pulled-right u-clickable" @click="isEdit = true">{{ $t('common.edit') }}</a>
    </div>
  </div>
</div>
</template>

<script>
import str from '@/util/str'
import site from '@/util/site'

export default {
  nane: 'EbEditUserEmail',

  props: {
    dispLabel: {
      type: Boolean,
      default: true,
    },
  },

  data(){
    return {
      isEdit: false,
      email: '',
      errorMsg: '',
    }
  },

  computed: {
  },

  created() {
    this.email = this.$store.getters.userInfo('email')
  },

  methods: {
    edit: async function() {
      if (this.email == this.$store.getters.userInfo('email')) {
        this.isEdit = false
        return
      }

      this.validate()
      if (this.errorMsg) return

      try {
        await this.$store.dispatch('changeEmail', this.email)
        this.showGlobalMessage(this.$t('msg["Sent verification email"]'), 'is-success')
        this.isEdit = false
      } catch (err) {
        console.log(err)// FOR DEBUG
        const i18nKey = site.convFirebaseErrorCodeToI18n(err.code)
        this.errorMsg = this.$t(i18nKey)
      }
    },

    cancel: async function() {
      this.email = this.$store.getters.userInfo('email')
      this.errorMsg = ''
      this.isEdit = false
    },

    validate: function() {
      this.errorMsg = ''
      if (this.isEmpty(this.email)) {
        this.errorMsg = this.$t('msg["Email is required"]')
      } else if (!str.checkEmail(this.email)) {
        this.errorMsg = this.$t('msg["Email is not valid"]')
      }
    },
  },
}
</script>

