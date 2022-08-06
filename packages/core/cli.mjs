import { buildAll } from './src/build.mjs'
import { startServer, startWss } from './src/server.mjs'
import chalk from 'chalk'
async function run(argv) {
  if (argv[0] === '-v' || argv[0] === '--version') {
    console.log('v0.0.1')
  } else {
    const options = getOptions(argv)
    start(options)
  }
}

async function start(options) {
  const start = Date.now()
  await buildAll(options)
  const end = Date.now()
  console.log(chalk.green(`compile time ${end - start}ms`))
  await startServer()
  await startWss()
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
