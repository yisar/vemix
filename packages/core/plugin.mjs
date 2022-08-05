export const nodeFetchPlugin = () => ({
  name: 'server-node-external',
  setup(b) {
    b.onResolve({ filter: /^node-fetch$/ }, () => ({ external: true }))
  },
})
