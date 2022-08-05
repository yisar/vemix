import { computed, h, inject, provide, ref } from 'vue'

export function useVktCtx() {
  return inject('vktCtx')
}

export function useAction() {
  return inject('actionData')
}

export function useLoader() {
  return inject('loaderData')
}

export function useTransition() {
  return inject('transition')
}

function appendQueryParams(url, params) {
  const qs = new URLSearchParams(params)
  const sep = url.indexOf('?') >= 0 ? '&' : '?'
  return `${url}${sep}${qs}`
}

export function getLeafRoute(routeManifest, route) {
  const path = typeof route === 'string' ? route : route.path
  const routeManifestArray = Object.values(routeManifest)
  return (
    routeManifestArray.find((r) => r.path === path && !r.layout) ||
    routeManifestArray.find((r) => r.path === path)
  )
}

export function getAncestorRoutes(routeManifest, route) {
  if (!route.parent) {
    return [route]
  }
  const parent = routeManifest[route.parent]
  return [route, ...getAncestorRoutes(routeManifest, parent)]
}

export async function fetchLoaderData(url, routeOrRoutes) {
  const routes = Array.isArray(routeOrRoutes) ? routeOrRoutes : [routeOrRoutes]
  const fullUrl = appendQueryParams(url, {
    _data: routes.map((r) => r.id).join(','),
  })
  const res = await fetch(fullUrl)
  const loaderData = await res.json()
  return loaderData
}

export const VktRoute = {
  name: 'VktRoute',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    const vktCtx = inject('vktCtx')
    provide(
      'actionData',
      computed(() => vktCtx.actionData)
    )
    provide(
      'loaderData',
      computed(() => vktCtx.loaderData[props.id])
    )
    return slots.default
  },
}
