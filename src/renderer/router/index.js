import Vue from 'vue'
import Router from 'vue-router'
import Logger from '../pages/logger'
import Document from '../pages/document'
import Excel from '../pages/excel'
import User from '../pages/user'
import LogList from '../pages/logList'
import TestList from '../pages/testList'

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/logger',
      name: 'logger',
      component: Logger
    },
    {
      path: '/document',
      name: 'document',
      component: Document
    },
    {
      path: '/excel',
      name: 'excel',
      component: Excel
    },
    {
      path: '/logList',
      name: 'logList',
      component: LogList
    },
    {
      path: '/testList',
      name: 'testList',
      component: TestList
    },
    {
      path: '/user',
      name: 'user',
      component: User
    },
    {
      path: '*',
      redirect: '/logger'
    }
  ]
})
