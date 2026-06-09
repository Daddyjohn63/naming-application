import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.join(__dirname, "..")
const imagesDir = path.join(webRoot, "public", "images")
const outDir = path.join(webRoot, "components", "marks")

const specs = [
  { file: "family.svg", fn: "FamilyMarkPaths" },
  { file: "cat-world.svg", fn: "CatWorldMarkPaths" },
  { file: "ineffable.svg", fn: "IneffableMarkPaths" },
]

fs.mkdirSync(outDir, { recursive: true })

for (const { file, fn } of specs) {
  const svg = fs.readFileSync(path.join(imagesDir, file), "utf8")
  const inner = svg
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim()
    .split(/(?=<(?:path|polygon)\b)/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => `      ${chunk.replace(/\/>$/, " />")}`)
    .join("\n")

  const content = `/** Auto-derived from public/images/${file} — theme via parent fill. */
export function ${fn}() {
  return (
    <>
${inner}
    </>
  )
}
`

  const outName = file.replace(".svg", "-mark.tsx")
  fs.writeFileSync(path.join(outDir, outName), content)
  console.log(`Wrote ${outName}`)
}
