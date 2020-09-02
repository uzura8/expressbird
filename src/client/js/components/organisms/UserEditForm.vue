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
    :message="isEmpty(errors.password) ? '' : errors.password[0]">
    <p v-if="isEdit && !isUpdatePassword">
      <a class="u-clickable" @click="isUpdatePassword = true">{{ $t('msg["Change password"]') }}</a>
    </p>
    <b-input
      v-else
      type="password"
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
import { Admin, Firebase } from '@/api'
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
      isUpdatePassword: false,
      defautVals: {},
    }
  },

  computed: {
    isEdit: function() {
      return this.isEmpty(this.userId) === false
    },

    isEdited: function() {
      if (this.isEdit === false) return true

      if (this.password.length > 0) return true
      if (this.email != this.defautVals.email) return true
      if (this.name != this.defautVals.name) return true
      if (this.type != this.defautVals.type) return true

      return false
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
      this.setUser()
    }
  },

  methods: {
    edit: function() {
      if (this.isEdited === false) {
        this.$router.push('/admin/users')
        return
      }

      this.validateAll()
      if (this.hasErrors) {
        this.showGlobalMessage(this.$t('msg["Correct inputs"]'))
        return
      }

      const vals = this.getEditVals()
      this.$store.dispatch('editUserByAdmin', vals)
        .then(() => {
          this.$router.push('/admin/users')
          const msg = this.$t(this.isEdit ? 'msg["Edit completed"]' : 'msg["Create completed"]')
          this.showGlobalMessage(msg, 'is-success')
        })
        .catch((err) => {
          console.log(err)// FOR DEBUG
          const i18nKey = site.convFirebaseErrorCodeToI18n(err.code)
          this.showGlobalMessage(this.$t(i18nKey))
        })
    },

    setUser: function() {
      this.$store.dispatch('setLoading', true)
      Admin.getUser(this.userId, this.authUserToken)
        .then((res) => {
          this.email = res.email
          this.name = res.name
          this.type = res.type
          this.defautVals = {
            email: this.email,
            name: this.name,
            type: this.type,
          }
          this.$store.dispatch('setLoading', false)
        })
        .catch((err) => {
          this.showGlobalMessage(this.$t('msg["Failed to get data from server"]'))
          this.$store.dispatch('setLoading', false)
        })
    },

    getEditVals: function(errors) {
      if (this.isEdit === false) {
        return {
          email: this.email,
          password: this.password,
          name: this.name,
          type: this.type,
        }
      }

      let vals = {}
      vals.id = this.userId
      if (this.password.length > 0) vals.password = this.password
      if (this.email != this.defautVals.email) vals.email = this.email
      if (this.name != this.defautVals.name) vals.name = this.name
      if (this.type != this.defautVals.type) vals.type = this.type
      return vals
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
      if (this.isEdit) {
        if (this.isUpdatePassword === false) return
        if (this.isEmpty(this.password)) return
      }

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

