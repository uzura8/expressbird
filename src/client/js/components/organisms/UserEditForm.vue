<template>
<div>
  <b-field :label="$t('common.type')"
    :type="isEmpty(errors.type) ? '' : 'is-danger'"
    :message="isEmpty(errors.type) ? '' : errors.type[0]">
    <b-select
      v-model="type"
      placeholder="Select type">
      <option
        v-for="item in types"
        :value="item"
        :key="item"
        v-text="convUserTypeToi18n(item)"
      ></option>
    </b-select>
  </b-field>

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
        @click="edit"
        v-text="isEdit ? $t('common.edit') : $t('common.create')"
      ></button>
    </div>
  </div>
</div>
</template>

<script>
import { User, Firebase } from '@/api'
import config from '@/config/config'
import str from '@/util/str'
import site from '@/util/site'

export default {
  name: 'SignUp',

  props: {
    userId: {
      type: String,
      default: null,
    },
  },

  data () {
    return {
      errors: {},
      types: ['normal', 'admin'],
      type: 'normal',
      name: '',
      email: '',
      password: '',
    }
  },

  computed: {
    isEdit: function() {
      return this.isEmpty(this.userId) === false
    },

    hasErrors: function() {
      let hasError = false
      Object.keys(this.errors).map(field => {
        if (this.errors[field].length > 0) hasError = true
      })
      return hasError
    },
  },

  created: function() {
    if (this.isEdit) {
    }
  },

  methods: {
    edit: function() {
      this.validateAll()
      if (this.hasErrors) {
        this.showGlobalMessage(this.$t('msg["Correct inputs"]'))
        return
      }

      const vals = {
        email: this.email,
        password: this.password,
        name: this.name,
        type: this.type,
      }
      this.$store.dispatch('createUserByAdmin', vals)
        .then(() => {
          this.$router.push('/admin/users')
          this.showGlobalMessage(this.$t('msg["Sign Up Completed"]'))
        })
        .catch((err) => {
          console.log(err)// FOR DEBUG
          const i18nKey = site.convFirebaseErrorCodeToI18n(err.code)
          this.showGlobalMessage(this.$t(i18nKey))
        })
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

