import path from 'path'
import fs from 'fs'

const dirname = new URL('.', import.meta.url).pathname
const routeDir = path.join(process.cwd(), 'routes')

const generateRelativePath = (d, f) => (d ? path.join(d, f) : f)

async function readRoutesDirectory(dir) {
  const files = []
  const rootDir = dir ? path.join(routeDir, dir) : routeDir
  const dirContents = await fs.promises.readdir(rootDir)
  for (let i = 0; i < dirContents.length; i++) {
    const entryPath = path.join(rootDir, dirContents[i])
    const stats = await fs.promises.stat(entryPath)
    const relativePath = generateRelativePath(dir, dirContents[i])
    if (stats.isDirectory()) {
      const parent =
        dirContents[i] === path.basename(dirContents[i + 1] || '', '.vue')
          ? generateRelativePath(dir, dirContents[i + 1] || '')
          : null
      const nested = await readRoutesDirectory(relativePath)
      files.push(
        ...nested.map((n) => ({
          ...n,
          ...(parent ? { parent } : {}),
        }))
      )
    } else {
      const layout =
        dirContents[i - 1] &&
        dirContents[i - 1] === path.basename(dirContents[i], '.vue')
      files.push({ path: relativePath, ...(layout ? { layout } : {}) })
    }
  }
  return files
}

function getPathFromFileName(file) {
  if (file === 'index.vue') {
    return '/'
  }
  if (file.endsWith('index.vue')) {
    return `/${path.dirname(file)}`
  }
  return `/${path.join(path.dirname(file), path.basename(file, '.vue'))}`
}

export const routePlugin = (build, filesPromise, type) => {
  build.onResolve({ filter: /^vkt:route-definition$/ }, async (args) => ({
    path: args.path,
    namespace: 'route-definition',
  }))

  build.onLoad({ filter: /.*/, namespace: 'route-definition' }, async () => {
    const files = await filesPromise
    const getImport = type === 'client' ? (p) => `${p}?client` : (p) => p

    const getChildRoutes = (f) => {
      const children = files.filter((c) => c.parent === f.path)
      if (!children.length) {
        return ''
      }
      return `
    children: [${children.map((c) => getRoute(c))}],`
    }

    const getRoute = (f) => `
  {
    id: '${f.path}',
    path: '${getPathFromFileName(f.path)}',
    component: async () => {
      const cmp = (await import('./${getImport(f.path)}')).default;
      return {
        name: 'RouteWrapper',
        render: (h) => h(VktRoute, { props: { id: '${f.path
      }' }, scopedSlots: { default: props => h(cmp, { props: {id: '${f.path
      }'} })}} ),
      };
    },
  ${getChildRoutes(f)}
  }`

    const contents = `
  import { h } from 'vue';
  import { VktRoute } from '../../core/src/api.mjs';
  
  export default [${files
        .filter((f) => !f.parent)
        .map(getRoute)
        .join(',')}];
  `

    return {
      resolveDir: routeDir,
      contents,
      loader: 'js',
    }
  })
}

export function manifestPlugin(build, filesPromise) {
  build.onResolve({ filter: /^vkt:route-manifest$/ }, async (args) => ({
    path: args.path,
    namespace: 'route-manifest',
  }))

  build.onLoad({ filter: /.*/, namespace: 'route-manifest' }, async () => {
    const files = await filesPromise
    const contents = `
${files.map((f, i) => `import * as m_${i} from './${f.path}';`).join('\n')}

export default {
  ${files
        .map(
          (f, i) => `'${f.path}': {
    id: '${f.path}',
    path: '${getPathFromFileName(f.path)}',
    parent: ${f.parent ? `'${f.parent}'` : 'null'},
    layout: ${f.layout === true},
    action: typeof m_${i}.action === 'undefined' ? null : m_${i}.action,
    loader: typeof m_${i}.loader === 'undefined' ? null : m_${i}.loader,
  }`
        )
        .join(',\n  ')}
};
`
    return {
      resolveDir: routeDir,
      contents,
      loader: 'js',
    }
  })
}

export const nodeFetchPlugin = () => ({
  name: 'server-node-external',
  setup(b) {
    b.onResolve({ filter: /^node-fetch$/ }, () => ({ external: true }))
  },
})

export const vktPlugin = ({ type }) => ({
  name: 'vkt-plugin',
  setup(b) {
    const filesPromise = readRoutesDirectory()
    manifestPlugin(b, filesPromise)
    routePlugin(b, filesPromise, type)
  },
})
