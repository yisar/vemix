import { build } from 'esbuild'
import vue2Plugin from 'esbuild-vue'
import path from 'path'
import chalk from 'chalk'
import { vktPlugin } from './plugin.mjs'

export async function buildSever(options) {
  const result = await build({
    entryPoints: [path.join(options.dirname.slice(1), './entry-server.mjs')],
    bundle: true,
    metafile: true,
    platform: 'node',
    format: 'cjs',
    treeShaking: true,
    outfile: 'dist/server/app.js',
    plugins: [
      vktPlugin({ type: 'server' }),
      vue2Plugin({
        extractCss: true,
        createCompilerOption: {
          template: {
            optimizeSSR: false
          }
        }
      }),
    ],
    watch: process.env.WATCH === 'true',
  })
  return result
}

export async function buildClient(options) {
  const result = await build({
    entryPoints: [path.join(options.dirname.slice(1), './entry-client.mjs')],
    bundle: true,
    format: 'esm',
    metafile: true,
    splitting: true,
    target: 'es2020',
    outdir: 'dist/client',
    plugins: [
      vktPlugin({ type: 'client' }),
      vue2Plugin({
        extractCss: true,
        createCompilerOption: {
          template: {
            optimizeSSR: false
          }
        }
      }),
    ],
    watch: process.env.WATCH === 'true',
  })
  return result
}

export async function buildAll(options) {
  options.entry = path.join(process.cwd(), options.e)
  options.dirname = new URL('.', import.meta.url).pathname

  const p1 = async () => {
    return await buildSever(options)
  }
  const p2 = async () => {
    return await buildClient(options)
  }
  const start = Date.now()
  await Promise.all([p1(), p2()])
  const end = Date.now()
  console.log(chalk.green(`compile time ${end - start}ms`))
}