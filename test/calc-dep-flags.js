const t = require('tap')
const calcDepFlags = require('../lib/calc-dep-flags.js')
const Node = require('../lib/node.js')
const Link = require('../lib/link.js')

const {
  normalizePath,
  printTree,
} = require('./utils.js')

const cwd = normalizePath(process.cwd())
t.cleanSnapshot = s => s.split(cwd).join('{CWD}')

t.test('flag stuff', t => {
  const root = new Node({
    path: '/x',
    realpath: '/x',
    pkg: {
      dependencies: { prod: '' },
      devDependencies: { dev: '' },
      optionalDependencies: { optional: '' },
      peerDependencies: { peer: '' },
    },
  })

  new Node({
    pkg: {
      name: 'optional',
      version: '1.2.3',
      dependencies: { devoptional: '', missing: '' },
    },
    parent: root,
  })

  new Node({
    pkg: {
      name: 'devoptional',
      version: '1.2.3',
    },
    parent: root,
  })

  new Node({
    pkg: {
      name: 'extraneous',
    },
    parent: root,
  })

  new Node({
    pkg: {
      name: 'peer',
      version: '1.2.3',
      dependencies: { peerdep: '' },
    },
    parent: root,
  })

  new Node({
    pkg: {
      name: 'peerdep',
      version: '1.2.3',
    },
    parent: root,
  })

  new Node({
    pkg: {
      name: 'prod',
      version: '1.2.3',
      dependencies: { proddep: '' },
      peerDependencies: { metapeer: '' },
    },
    parent: root,
  })

  new Node({
    pkg: {
      name: 'metapeer',
      version: '1.2.3',
      dependencies: { metapeerdep: '' },
    },
    parent: root,
  })

  new Node({
    pkg: {
      name: 'metapeerdep',
      version: '1.2.3',
    },
    parent: root,
  })

  new Node({
    pkg: {
      name: 'proddep',
      version: '1.2.3',
      dependencies: { proddep: '' },
    },
    parent: root,
  })

  new Node({
    pkg: {
      name: 'dev',
      version: '1.2.3',
      dependencies: { devdep: '' },
    },
    parent: root,
  })

  const devdep = new Node({
    pkg: {
      name: 'devdep',
      version: '1.2.3',
      dependencies: { proddep: '', linky: '', devoptional: '' },
      optionalDependencies: { devandoptional: '' },
    },
    parent: root,
  })

  new Node({
    pkg: {
      name: 'devandoptional',
      version: '1.2.3',
    },
    parent: root,
  })

  const linky = new Link({
    pkg: {
      name: 'linky',
      version: '1.2.3',
      dependencies: { linklink: '' },
    },
    realpath: '/x/y/z',
    parent: devdep,
  })

  // a link dep depended upon by the target of a linked dep
  new Link({
    pkg: {
      name: 'linklink',
      version: '1.2.3',
    },
    realpath: '/l/i/n/k/link',
    parent: linky.target,
  })

  calcDepFlags(root)

  t.matchSnapshot(printTree(root), 'after')
  t.end()
})

t.test('no reset', async t => {
  const root = new Node({
    path: '/some/path',
    realpath: '/some/path',
    pkg: {
      dependencies: { foo: '' },
    },
  })
  const foo = new Node({parent: root, pkg: { name: 'foo', version: '1.2.3' }})

  root.optional = false
  root.dev = true
  root.extraneous = false

  calcDepFlags(root, false)
  t.matchSnapshot(printTree(root), 'after')
  t.equal(root.dev, true, 'root.dev')
  t.equal(foo.dev, true, 'foo.dev')
  t.equal(root.optional, false, 'root.optional')
  t.equal(foo.optional, false, 'foo.optional')
  t.equal(root.extraneous, false, 'root.extraneous')
  t.equal(foo.extraneous, false, 'foo.extraneous')
})
