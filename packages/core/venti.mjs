import { build } from 'esbuild'
import vue2Plugin from 'esbuild-vue'
import nodeFetchPlugin from './plugins/node-fetch.mjs'

class Venti {
  constructor(options) {
    this.options = options
  }

  async buildSever() {
    const result = await build({
      entryPoints: ['vuemix/entry-server.mjs'],
      bundle: true,
      metafile: true,
      platform: 'node',
      format: 'cjs',
      treeShaking: true,
      outfile: 'dist/server/app.js',
      plugins: [
        nodeFetchPlugin(),
        vuemixPlugin({ type: 'server' }),
        vue2Plugin({ extractCss: true }),
      ],
      watch: process.env.WATCH === 'true',
    })
    return result
  }

  async buildClient() {
    const result = await build({
      entryPoints: ['vuemix/entry-client.mjs'],
      bundle: true,
      format: 'esm',
      metafile: true,
      splitting: true,
      target: 'es2020',
      outdir: 'dist/client',
      plugins: [
        nodeFetchPlugin(),
        vue2Plugin({ type: 'client' }),
      ],
      watch: process.env.WATCH === 'true',
    })
  }

  
}

export const venti = (options) => new Venti(options)
