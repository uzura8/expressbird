import 'es6-promise/auto'
import Vue from 'vue'
import store from '@/store'
import i18n from '@/i18n'
import '@/sanitize'
import App from '@/AppIncluded'

import firebase from 'firebase/app'
import { SiteConfig } from '@/api/'

import mixin from '@/mixins/include'
Vue.mixin(mixin);

import * as filters from '@/filters';
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});

SiteConfig.get('firebase')
  .then(res => {
    firebase.initializeApp(res)
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)

    new Vue({
      el: '#app',
      store,
      i18n,
      render: h => h(App)
    })
  })
  .catch(err => {
    throw err
  })
