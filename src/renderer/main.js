import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import Fetch from './plugins/fetch';
import 'element-ui/lib/theme-chalk/index.css';
import './styles/init.css';
import '../utils/findInPage'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.prototype.$fetch = Fetch
Vue.config.productionTip = false
Vue.use(ElementUI)

new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
