import { buildAll } from './src/build.mjs'
import { startServer, startWss } from './src/server.mjs'
import { watch } from 'chokidar'

async function run(argv) {
  if (argv[0] === '-v' || argv[0] === '--version') {
    console.log('v0.0.1')
  } else {
    const options = getOptions(argv)
    start(options)
  }
}

async function start(options) {
  await buildAll(options)

  const { reload: reloadServer } = await startServer()
  const { reload: reloadClient } = await startWss()

  if (options.w) {
    watch(['**/*.{ts,tsx,js,jsx,vue,css,sass}'], {
      ignoreInitial: true,
      cwd: process.cwd(),
      ignored: [
        'node_modules',
        '.git',
        'test-fixtures',
        'dist'
      ]
    })
      .on('add', async (file) => {
        await buildAll(options)
        await reloadServer(file)
        reloadClient(file)

      })
      .on('change', async (file) => {
        await buildAll(options)
        await reloadServer(file)
        reloadClient(file)
      })
      .on('unlink', async (file) => {
        await buildAll(options)
        await reloadServer(file)
        reloadClient(file)
      })
  }
}

const getOptions = (argv) => {
  let out = {
    e: './',
    o: './dist/',
  }
  for (let i = 0; i < argv.length; i++) {
    const name = argv[i]
    const value = argv[i + 1]
    if (name === '-w' || name === '--watch') {
      out['w'] = true
    }
    if (name[0] !== '-' || !value) {
      continue
    }
    if (name === '-e' || name === '--entry') {
      out['e'] = value
    }
    if (name === '-o' || name === '--output') {
      out['o'] = value
    }
  }
  return out
}

run(process.argv.slice(2))
