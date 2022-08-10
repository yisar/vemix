import path from 'path'
import child_process from 'child_process'
import { fileURLToPath } from 'url'
import { WebSocketServer } from 'ws'
import { watch } from 'chokidar'
import { buildAll } from './src/build.mjs'

let childProcess = null

async function run(argv) {
  if (argv[0] === '-v' || argv[0] === '--version') {
    console.log('v0.0.1')
  } else {
    const options = getOptions(argv)
    start(options)
  }
}

function restartServer(moduleName, script) {
  return new Promise((resolve, reject) => {
    if (childProcess && !childProcess.killed) {
      childProcess.kill()
    }
    
    childProcess = child_process
      .fork(script, {
        stdio: 'inherit',
      })
      .on('error', reject)
      .on('message', message => {
        
        if (message === 'ok') {
          resolve()
        }
      })
    
    if (moduleName) {
      console.log(`[${moduleName}] restart ${script}`)
    } else {
      console.log(`start ${script}`)
    }
  })
}

async function start(options) {
  await buildAll(options)

  const { reload: reloadClient } = await startWss()

  function getServerModule() {
    return path.dirname(fileURLToPath(import.meta.url)) + '/src/server.mjs'
  }

  if (options.w) {
    watch(['**/*.{ts,tsx,js,jsx,vue,css,sass}'], {
      ignoreInitial: true,
      cwd: process.cwd(),
      ignored: ['node_modules', '.git', 'test-fixtures', 'dist'],
    })
      .on('ready', () => {
        restartServer('', getServerModule())
      })
      .on('add', async (file) => {
        await buildAll(options)
        await restartServer(file, getServerModule())
        reloadClient(file)
      })
      .on('change', async (file) => {
        await buildAll(options)
        await restartServer(file, getServerModule())
        reloadClient(file)
      })
      .on('unlink', async (file) => {
        await buildAll(options)
        await restartServer(file, getServerModule())
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
