import Vue from 'vue'
import Router from 'vue-router'
import Logger from '../pages/logger'
import Document from '../pages/document'
import Excel from '../pages/excel'
import User from '../pages/user'
import LogList from '../pages/logList'
import TestList from '../pages/testList'
import WebPage from '../pages/webPage'

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
      component: Logger,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/document',
      name: 'document',
      component: Document,
      meta: {
        keepAlive: false
      }
    },
    {
      path: '/excel',
      name: 'excel',
      component: Excel,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/logList',
      name: 'logList',
      component: LogList,
      meta: {
        keepAlive: false
      }
    },
    {
      path: '/testList',
      name: 'testList',
      component: TestList,
      meta: {
        keepAlive: false
      }
    },
    {
      path: '/user',
      name: 'user',
      component: User,
      meta: {
        keepAlive: false
      }
    },
    {
      path: '/webPage',
      name: 'webPage',
      component: WebPage,
      meta: {
        keepAlive: false
      }
    },
    {
      path: '*',
      redirect: '/logger'
    }
  ]
})
