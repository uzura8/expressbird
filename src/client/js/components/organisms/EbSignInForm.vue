<template>
<div class="ebSignInForm">
  <b-field :label="$t('common.email')"
    :type="isEmpty(errors.email) ? '' : 'is-danger'"
    :message="isEmpty(errors.email) ? '' : errors.email[0]">
    <b-input type="email"
      v-model="email"
      icon="envelope"
      icon-pack="fas"
      @blur="validate('email')"
      @keyup.native.enter="keyDownEnter($event)"
      :placeholder="$t('common.email')">
    </b-input>
  </b-field>

  <b-field :label="$t('common.password')"
    :type="isEmpty(errors.password) ? '' : 'is-danger'"
    :message="isEmpty(errors.password) ? '' : errors.password[0]">
    <b-input type="password"
      v-model="password"
      :password-reveal="true"
      icon="lock"
      icon-pack="fas"
      @blur="validate('password')"
      @keyup.native.enter="keyDownEnter($event)"
      :placeholder="$t('common.password')">
    </b-input>
  </b-field>

  <div class="field is-grouped">
    <div class="control">
      <button
        class="button is-link"
        :disabled="hasErrors"
        @click="signIn">{{ $t('common.signIn') }}</button>
    </div>
  </div>
</div>
</template>

<script>
import { User } from '@/api/'
import str from '@/util/str'

export default {
  name: 'SignIn',

  props: {
    isUseAdmin: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      errors: {},
      email: '',
      password: '',
    }
  },

  computed: {
    hasErrors: function() {
      let hasError = false
      Object.keys(this.errors).map(field => {
        if (this.errors[field].length > 0) hasError = true
      })
      return hasError
    },
  },

  created: function() {
  },

  methods: {
    signIn: function() {
      this.validateAll()
      if (this.hasErrors) {
        this.showGlobalMessage(this.$t('msg["Correct inputs"]'))
      } else {
        const vals = {
          email: this.email,
          password: this.password,
        }
        this.$store.dispatch('authenticate', vals)
          .then((res) => {
            if (!this.isEmpty(this.$route.query.redirect)) {
              this.$router.push({ path:this.$route.query.redirect })
            } else {
              if (this.isUseAdmin && this.isAdmin) {
                this.$router.push({ name:'AdminTop' })
              } else {
                this.$router.push({ name:'UserTop' })
              }
            }
          })
          .catch(err => {
            this.handleApiError(err, this.$t('msg["Sign In failed"]'))
          })
      }
    },

    keyDownEnter: function(event) {
      if (event.keyCode !== 13) return
      this.signIn()
    },

    setErrors: function(errors) {
      const keys = Object.keys(this.errors)
      errors.map(err => {
        const field = err.param
        this.initErrors(field)
        this.errors[field].push(err.msg)
      })
    },

    validateAll: function() {
      ['email', 'password'].map(field => {
        this.validate(field)
      })
    },

    validate: function(field) {
      const key = 'validate' + str.capitalize(field)
      this[key]()
    },

    validateEmail: function() {
      this.initError('email')
      if (this.isEmpty(this.email)) this.errors.email.push(this.$t('msg["Email is required"]'))
      if (!str.checkEmail(this.email)) this.errors.email.push(this.$t('msg["Email is not valid"]'))
    },

    validatePassword: function() {
      this.initError('password')
      if (this.isEmpty(this.password)) {
        this.errors.password.push(this.$t('msg["Password is required"]'))
      }
      if (this.password.length < 6) {
        this.errors.password.push(this.$t('msg["Password must be at least 6 characters"]'))
      }
    },

    initError: function(field) {
      this.$set(this.errors, field, [])
    },

    initErrors: function(field) {
      const keys = Object.keys(this.errors)
      if (!this.inArray(field, keys)) {
        this.initError(field)
      }
    },

    throwReject (err) { return Promise.reject(err) }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.signin {
}
</style>
