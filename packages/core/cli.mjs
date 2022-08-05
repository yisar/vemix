async function run(argv) {
  const options = {
    e: argv.entry,
    o: argv.output,
    i: "/",
    w: argv.watch,
    m: argv.minify,
    p: argv.publicUrl,
    t: argv.t,
  }
  console.log(argv)
}

if (argv.version) {
  console.log('version:', require('./package.json').version)
} else {
  run(argv)
}
