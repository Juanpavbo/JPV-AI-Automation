import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const functionsDir = join(root, '.vercel', 'output', 'functions')
const targetRuntime = 'nodejs22.x'

let patched = 0

function walk(dir) {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full)
    } else if (entry.name === '.vc-config.json') {
      const config = JSON.parse(readFileSync(full, 'utf8'))
      if (config.runtime && config.runtime !== targetRuntime) {
        config.runtime = targetRuntime
        writeFileSync(full, JSON.stringify(config, null, 2))
        patched += 1
        console.log(`[fix-vercel-runtime] ${full} -> ${targetRuntime}`)
      }
    }
  }
}

walk(functionsDir)

if (patched === 0) {
  console.log('[fix-vercel-runtime] no .vc-config.json found under .vercel/output/functions')
}
