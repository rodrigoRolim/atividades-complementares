import Vue from 'vue'
import Router from 'vue-router'
import AdminLogin from '@/components/AdminLogin'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'AdminLogin',
      component: AdminLogin
    }
  ]
})
