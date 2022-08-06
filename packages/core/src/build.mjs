import { build } from 'esbuild'
import vue2Plugin from 'esbuild-vue'
import { nodeFetchPlugin } from './plugins/node-fetch.mjs'

export async function buildSever() {
  const result = await build({
    entryPoints: ['./entry-server.mjs'],
    bundle: true,
    metafile: true,
    platform: 'node',
    format: 'cjs',
    treeShaking: true,
    outfile: 'dist/server/app.js',
    plugins: [
      nodeFetchPlugin(),
      vktPlugin({ type: 'server' }),
      vue2Plugin({ extractCss: true }),
    ],
    watch: process.env.WATCH === 'true',
  })
  return result
}

export async function buildClient() {
  const result = await build({
    entryPoints: ['./entry-client.mjs'],
    bundle: true,
    format: 'esm',
    metafile: true,
    splitting: true,
    target: 'es2020',
    outdir: 'dist/client',
    plugins: [
      nodeFetchPlugin(),
      vktPlugin({ type: 'client' }),
      vue2Plugin({ type: 'client' }),
    ],
    watch: process.env.WATCH === 'true',
  })
  return result
}

export async function buildAll(options) {
  return Promise.all([buildSever, buildClient])
}
