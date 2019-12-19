import 'es6-promise/auto'
import config from '@/config/config'
import Vue from 'vue'
import router from '@/router'
import i18n from '@/i18n'
import store from '@/store'
import App from '@/App'
import '@/common';

import Firebase from '@/firebase'
if (config.firebase.isEnabled) Firebase.init()

import Buefy from 'buefy'
Vue.use(Buefy)

import moment from 'moment'
import 'moment/locale/ja'
moment.locale('en');
Vue.filter('dateFormat', function (date, format='LLL') {
  return moment(date).format(format);
});

import mixin from '@/mixins/site'
Vue.mixin(mixin);

import * as filters from '@/filters';
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})

