import { spawn } from 'child_process'

export function restart(argv) {
    console.log('restart')
    spawn('node', ['./cli.js'])
}
