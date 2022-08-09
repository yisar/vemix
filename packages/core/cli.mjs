import { buildAll } from './src/build.mjs'
import child_process from 'child_process'
import { watch } from 'chokidar'
import { WebSocketServer } from 'ws'

let childProcess = null

async function run(argv) {
  if (argv[0] === '-v' || argv[0] === '--version') {
    console.log('v0.0.1')
  } else {
    const options = getOptions(argv)
    start(options)
  }
}

function restartServer(script) {
  if (childProcess && !childProcess.killed) {
    childProcess.kill()
  }
  childProcess = child_process.spawn('node', [script], {
    stdio: 'inherit',
  })
  console.log(`[${primary(moduleName)}] restart ${normal(script)}`)
}

async function start(options) {
  await buildAll(options)

  const { reload: reloadClient } = await startWss()

  if (options.w) {
    watch(['**/*.{ts,tsx,js,jsx,vue,css,sass}'], {
      ignoreInitial: true,
      cwd: process.cwd(),
      ignored: ['node_modules', '.git', 'test-fixtures', 'dist'],
    })
      .on('add', async (file) => {
        await buildAll(options)
        restartServer('./server.mjs')
        reloadClient(file)
      })
      .on('change', async (file) => {
        await buildAll(options)
        restartServer('./server.mjs')
        reloadClient(file)
      })
      .on('unlink', async (file) => {
        await buildAll(options)
        restartServer('./server.mjs')
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

export async function startWss() {
  const wss = new WebSocketServer({
    port: 5678,
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      clientNoContextTakeover: true,
      serverNoContextTakeover: true,
      serverMaxWindowBits: 10,
      concurrencyLimit: 10,
      threshold: 1024,
    },
  })

  const reload = (file) => {
    console.log('reload: ', file)
    if (wss.clients) {
      for (const client of wss.clients) {
        client.send('reload')
      }
    }
  }

  return { reload }
}

run(process.argv.slice(2))
