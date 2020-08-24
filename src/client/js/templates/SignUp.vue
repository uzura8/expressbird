<template>
<div class="signup">
  <h1 class="title">{{ $t('common.signUp') }}</h1>

  <b-field :label="$t('common.email')"
    :type="isEmpty(errors.email) ? '' : 'is-danger'"
    :message="isEmpty(errors.email) ? $t(`form['Used for Sign In']`) : errors.email[0]">
    <b-input type="email"
      v-model="email"
      icon="envelope"
      icon-pack="fas"
      @blur="validate('email')"
      :placeholder="$t('common.email')">
    </b-input>
  </b-field>

  <b-field :label="$t('common.password')"
    :type="isEmpty(errors.password) ? '' : 'is-danger'"
    :message="isEmpty(errors.password) ? $t(`form['Used for Sign In']`) : errors.password[0]">
    <b-input type="password"
      v-model="password"
      :password-reveal="true"
      icon="lock"
      icon-pack="fas"
      @blur="validate('password')"
      :placeholder="$t('common.password')">
    </b-input>
  </b-field>

  <b-field :label="$t('common.userName')"
    :type="isEmpty(errors.name) ? '' : 'is-danger'"
    :message="isEmpty(errors.name) ? $t(`form['Used for display user name']`) : errors.name[0]">
    <b-input v-model="name"
      @blur="validate('name')"
      :placeholder="$t('common.userName')">
    </b-input>
  </b-field>

  <div class="field is-grouped">
    <div class="control">
      <button
        class="button is-link"
        :disabled="hasErrors"
        @click="signUp">{{ $t('common.register') }}</button>
    </div>
  </div>

  <p class="u-mt5">
    {{ $t('msg["Do you have an account?"]') }} 
    <router-link to="/signin">{{ $t('msg["sign in now!!"]' )}}</router-link>
  </p>
</div>
</template>

<script>
import { User, Firebase } from '@/api'
import config from '@/config/config'
import str from '@/util/str'

export default {
  name: 'SignUp',

  data () {
    return {
      errors: {},
      name: '',
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
    signUp: function() {
      this.validateAll()
      if (this.hasErrors) {
        this.showGlobalMessage(this.$t('msg["Correct inputs"]'))
      } else {
        const vals = {
          name: this.name,
          email: this.email,
          password: this.password,
        }
        this.$store.dispatch('createUserWithEmailSend', vals)
          .then(() => {
            this.$router.push({ name: 'SentVerificationMail' })
          })
          .catch((err) => {
            let msg = ''
            switch(err.code) {
              case 'auth/email-already-in-use':
                msg = this.$t('msg["Email is alredy in use"]')
                break
              case 'auth/invalid-email':
                msg = this.$t('msg["Email is not valid"]')
                break
              //case 'auth/requires-recent-login':
              //  break;
              default:
                console.log(err)// FOR DEBUG
                msg = this.$t('msg["Sign Up Failed"]')
                break
            }
            this.showGlobalMessage(msg)
          })
      }
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
      ['email', 'password', 'name'].map(field => {
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

    validateName: function() {
      this.initError('name')
      if (this.isEmpty(this.name)) {
        this.errors.name.push(this.$t('msg["UserName is required"]'))
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.signup {
}
</style>
