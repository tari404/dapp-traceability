import Vue from 'vue'
import App from './App.vue'
import store from './store'
import i18n from './language'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  store,
  i18n
}).$mount('#app')
