import { reactive } from 'vue'

import { getLeafRoute, getAncestorRoutes, fetchLoaderData } from './api.mjs'
import createVktApp from './app.mjs'

const vktCtx = reactive({
  routeManifest: window.__vkt.routeManifest,
  actionData: window.__vkt.actionData,
  loaderData: window.__vkt.loaderData,
  transition: { state: 'idle' },
})

const { app, router } = createVktApp(vktCtx, 'history')

window.__vkt.app = app
window.__vkt.router = router
window.__vkt.ctx = vktCtx

function useClientLoader(routerInstance, routeManifest) {
  let loaderPromise

  routerInstance.beforeEach(async (to, from, next) => {
    const toLeafRoute = getLeafRoute(routeManifest, to)
    const toRoutes = getAncestorRoutes(routeManifest, toLeafRoute)
    const fromRoutes = getAncestorRoutes(
      routeManifest,
      getLeafRoute(routeManifest, from)
    )
    const loaderRoutes = toRoutes.filter(
      ({ id, hasLoader }) =>
        hasLoader &&
        (id === toLeafRoute.id || !fromRoutes.find((r) => r.id === id))
    )

    if (!loaderRoutes.length) {
      next()
      return
    }
    if (vktCtx.transition.state === 'idle') {
      vktCtx.transition = {
        state: 'loading',
        type: 'load',
        location: to.path,
      }
    }
    loaderPromise = fetchLoaderData(to.fullPath, loaderRoutes)
    next()
  })

  routerInstance.beforeResolve(async (to, from, next) => {
    try {
      const loaderData = await loaderPromise
      Object.assign(vktCtx.loaderData, loaderData)
      next()
    } catch (e) {
      vktCtx.transition = { state: 'idle' }
      next(e)
    }
  })

  routerInstance.afterEach(() => {
    vktCtx.transition = { state: 'idle' }
  })

  router.onError(() => {
    loaderPromise = null
  })
}

router.onError((err) => {
  console.error('Router Error:', err)
})

router.onReady(() => {
  useClientLoader(router, window.__vkt.routeManifest)
  app.$mount('#app')
})
