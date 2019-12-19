import Vue from 'vue'
import VueI18n from 'vue-i18n';
import trsEn from './translations/en'
import trsJa from './translations/ja'
import trsTh from './translations/th'

Vue.use(VueI18n);
//var locale = document.getElementsByTagName('html')[0].getAttribute('lang');
const locale = window.navigator.language
const messages = {
  en: trsEn,
  ja: trsJa,
  th: trsTh,
}
const i18n = new VueI18n({
  locale: locale,
  fallbackLocale: 'en',
  messages: messages,
})
//
//import moment from 'moment';
//if (locale !== 'en') {
//  require('moment/locale/' + locale);
//  moment.locale(locale);
//}
//Vue.filter('moment', function (date) {
//  return moment(date).format('LLL');
//});
//
export default i18n
