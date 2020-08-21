import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import routes from './routes'
import arr from '@/util/arr'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  saveScrollPosition: true,
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (to.hash) {
      return { selector: to.hash };
    } else if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  }
});

router.beforeEach((to, from, next) => {
  store.dispatch('setHeaderMenuOpen', false)

  const routeByAuthState = () => {
    const isAdminPath = to.path.startsWith('/admin')
    const forbiddenDispPathsOnAuth = ['/signin', '/signup', '/admin/signin']
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    if (requiresAuth) {
      if (store.state.auth.state) {
        if (!store.getters.checkUserType('admin')) {
          if (!store.getters.isEmailVerified()) {
            next({ name:'RequiredEmailVerification' })
          } else if (isAdminPath) {
            next({ name:'UserTop' })
          } else {
            next()
          }
        } else {
          next()
        }
      } else {
        next({
          path: isAdminPath ? '/admin/signin' :  '/signin',
          query: { redirect: to.fullPath }
        })
      }
    } else {
      if (arr.inArray(to.path, forbiddenDispPathsOnAuth) && store.state.auth.state) {
        next(isAdminPath ? { name:'UserTop' } : { name:'AdminTop' })
      } else {
        next()
      }
    }
  }

  if (store.state.auth.state === null
    || store.state.auth.state && !store.state.auth.token) {
    store.dispatch('checkAuthenticate')
      .then(() => {
        routeByAuthState()
      })
      .catch(err => {
        console.log(err)
        routeByAuthState()
      })
  } else {
    routeByAuthState()
  }
})

export default router
