import { build } from 'esbuild'
import vue2Plugin from 'esbuild-vue'
import path from 'path'
import { nodeFetchPlugin, vktPlugin } from './plugin.mjs'
let defineOptions = {}

export async function buildSever(options) {
  const result = await build({
    entryPoints: [path.join(options.dirname, './entry-server.js')],
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

export async function buildClient(options) {
  const result = await build({
    entryPoints: [path.join(options.dirname, './entry-client.mjs')],
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
  const dirname = new URL('.', import.meta.url).pathname.slice(1)
  defineOptions = options
  options.dirname = dirname
  // await buildClient(options)
  await buildSever(options)
}

export function getOptions() {
  return defineOptions
}
