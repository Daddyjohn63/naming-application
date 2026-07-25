import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.join(__dirname, "..")
const sourcePath = path.join(webRoot, "public", "images", "Artboard 29.svg")

const source = fs.readFileSync(sourcePath, "utf8")
const inner = source
  .replace(/^<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .trim()
  .replace(/<path /g, '<path fill="#0F1B2D" ')

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Purrfectly Named">
  <rect width="512" height="512" rx="112" fill="#FAF6EF"/>
  <rect x="28" y="28" width="456" height="456" rx="96" fill="#F3E9D8"/>
  <svg x="64" y="64" width="384" height="384" viewBox="0 0 2000 2000">
${inner}
  </svg>
</svg>
`

const targets = [
  path.join(webRoot, "public", "images", "favicon.svg"),
  path.join(webRoot, "app", "icon.svg"),
]

for (const target of targets) {
  fs.writeFileSync(target, favicon)
  console.log(`Wrote ${path.relative(webRoot, target)}`)
}
