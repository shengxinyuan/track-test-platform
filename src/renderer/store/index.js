import Vue from 'vue'
import Vuex from 'vuex'
import common from './modules/common'
import logger from './modules/logger'
import logList from './modules/logList'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    common,
    logger,
    logList
  }
})