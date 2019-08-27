import 'es6-promise/auto'
import Vue from 'vue'
import router from './router'
import store from './store'
import './common';

import Buefy from 'buefy'
Vue.use(Buefy)

import moment from 'moment'
import 'moment/locale/ja'
moment.locale('ja');
Vue.filter('dateFormat', function (date, format='LLL') {
  return moment(date).format(format);
});

import util from './util'
import listener from './listener'
import config from './configs'
Vue.mixin({
  computed: {
    isAuth: function () {
      return this.$store.state.auth.state
    },
  },
  methods: {
    siteUri: config.uri,
    getConfig: config.get,
    isEmpty: util.isEmpty,
    inArray: util.inArray,
    listen: listener.listen,
    destroyed: listener.destroyed,
  },
});

Vue.filter('numFormat', function (num) {
  num = parseInt(num)
  if (isNaN(num)) return 0
  return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
});
Vue.filter('substr', function (text, num) {
  return util.substr(text, num, '...')
});

new Vue({
  el: '#app',
  computed: {
    isLoading () {
      return store.state.common.isLoading
    },
    isHeaderMenuOpen: function () {
      return store.state.common.isHeaderMenuOpen
    },
  },
  created: function () {
  },
  methods: {
    toggleHeaderMenuOpen: function () {
      store.dispatch('setHeaderMenuOpen', !this.isHeaderMenuOpen)
    },
  },
  store,
  router,
});

