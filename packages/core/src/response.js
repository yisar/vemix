import { Headers, Response } from 'node-fetch'

export { Headers, Response } from 'node-fetch'

export function json(data, init) {
  let responseInit
  if (typeof init === 'number') {
    responseInit = { status: init }
  }
  const headers = new Headers(responseInit.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json; charset=utf-8')
  }
  return new Response(JSON.stringify(data), {
    ...responseInit,
    headers,
  })
}

export function redirect(location, init = 302) {
  let responseInit = init
  if (typeof responseInit === 'number') {
    responseInit = { status: responseInit }
  } else if (typeof responseInit.status === 'undefined') {
    responseInit.status = 302
  }

  const headers = new Headers(responseInit.headers)
  headers.set('Location', location)

  return new Response(null, {
    ...responseInit,
    headers,
  })
}
