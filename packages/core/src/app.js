import Vue, { computed, provide } from 'vue'
import VueRouter from 'vue-router'
import routes from 'vkt:route-definition'
import RootView from '../app/root.vue'

export default function createVktApp(vktCtx, mode) {
  Vue.use(VueRouter)
  const router = new VueRouter({ mode, routes })
  const app = new Vue({
    setup() {
      provide('vktCtx', vktCtx)
      provide(
        'transition',
        computed(() => vktCtx.transition)
      )
      return (h) => h(RootView)
    },
    router,
  })
  return { app, router }
}
