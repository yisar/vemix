const { createRenderer } = require('vue-server-renderer')

// import routes from 'vkt:route-manifest'

import createApp from './app.mjs'

export const routeManifest = {}

export async function serverCreateApp(context) {
  const { app, router } = createApp(
    {
      routeManifest,
      actionData: context.actionData,
      loaderData: context.loaderData,
      transition: { state: 'idle' },
    },
    'abstract'
  )
  await router.push(context.url)
  await routerReady(router)
  return { app, router }
}

const routerReady = (router) => {
  return new Promise((r) => {
    router.onReady(() => {
      r(0)
    })
  })
}

export async function renderApp(app, context) {
  const renderer = createRenderer({})
  const html = renderer.renderToString(app, context)
  return html
}
