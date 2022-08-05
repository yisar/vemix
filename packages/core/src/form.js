import { useRouter } from 'vue-router'

export const Form = {
  name: 'VktForm',
  props: {
    reloadDocument: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    const vktCtx = useVktCtx()
    const router = useRouter()
    const el = ref()

    const onSubmit = async (e) => {
      e.preventDefault()

      const method = (attrs.method || 'post').toLowerCase()
      const url = attrs.action || window.location.pathname
      const activeRoute = getLeafRoute(vktCtx.routeManifest, url)
      const formData = new FormData(el.value)

      if (
        e?.submitter.tagName.toLowerCase() === 'button' &&
        e.submitter.name &&
        e.submitter.value
      ) {
        formData.append(e.submitter.name, e.submitter.value)
      }

      if (method === 'get') {
        vktCtx.transition = {
          state: 'submitting',
          type: 'loaderSubmission',
          submission: formData,
          location: url,
        }
        const fullUrl = appendQueryParams(url, formData)
        router.push(fullUrl)
        return
      }

      if (method !== 'post') {
        throw new Error('Non-get/post methods are not supported by VktForm')
      }

      vktCtx.transition = {
        state: 'submitting',
        type: 'actionSubmission',
        submission: formData,
        location: url,
      }
      const qs = new URLSearchParams({
        _action: activeRoute.id,
      })
      const res = await fetch(`${url}?${qs}`, {
        method,
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData),
      })

      const { headers } = res
      if (headers.get('x-vkt-redirect')) {
        Object.assign(vktCtx.transition, {
          state: 'loading',
          type: 'actionRedirect',
        })
        router.push({
          path: headers.get('x-vkt-location'),
          force: true,
        })
        return
      }

      const actionData = await res.json()

      if (res.status >= 200 && res.status <= 299) {
        Object.assign(vktCtx.transition, {
          state: 'loading',
          type: 'actionReload',
        })
        const loaderData = await fetchLoaderData(url, activeRoute)
        Object.assign(vktCtx.loaderData, loaderData)
      }
      vktCtx.actionData = actionData
      vktCtx.transition = { state: 'idle' }
    }

    const formProps = {
      ref: el,
      ...attrs,
      ...(!props.reloadDocument ? { onSubmit } : {}),
    }
    return () => h('form', formProps, slots.default())
  },
}
