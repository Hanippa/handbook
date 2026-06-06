const fs = require("fs")
const path = require("path")

const rootCandidates = [
  process.env.QUARTZ_OUTPUT_DIR,
  "public",
  "_site",
].filter(Boolean)
const replacements = new Map([
  ['<html lang="en" dir="ltr">', '<html lang="he" dir="rtl">'],
  ['<html lang="en">', '<html lang="he" dir="rtl">'],
  ['href="../../index.css"', 'href="/handbook/index.css"'],
  ['href="../index.css"', 'href="/handbook/index.css"'],
  ['href="index.css"', 'href="/handbook/index.css"'],
  ['src="../../prescript.js"', 'src="/handbook/prescript.js"'],
  ['src="../prescript.js"', 'src="/handbook/prescript.js"'],
  ['src="prescript.js"', 'src="/handbook/prescript.js"'],
  ['src="../../postscript.js"', 'src="/handbook/postscript.js"'],
  ['src="../postscript.js"', 'src="/handbook/postscript.js"'],
  ['src="postscript.js"', 'src="/handbook/postscript.js"'],
  ['href="../../static/', 'href="/handbook/static/'],
  ['href="../static/', 'href="/handbook/static/'],
  ['href="static/', 'href="/handbook/static/'],
  ['fetch("../../static/', 'fetch("/handbook/static/'],
  ['fetch("../static/', 'fetch("/handbook/static/'],
  ['fetch("static/', 'fetch("/handbook/static/'],
  ['href="../..">Handbook</a>', 'href="/handbook/">Handbook</a>'],
  ['href="..">Handbook</a>', 'href="/handbook/">Handbook</a>'],
  ['href=".">Handbook</a>', 'href="/handbook/">Handbook</a>'],
  [
    "../../handbook/guru/assets/images/open-repair-ticket/",
    "https://raw.githubusercontent.com/Hanippa/handbook/gh-pages/guru/assets/images/open-repair-ticket/",
  ],
  [
    "../.././assets/images/open-repair-ticket/",
    "https://raw.githubusercontent.com/Hanippa/handbook/gh-pages/guru/assets/images/open-repair-ticket/",
  ],
])

const root = rootCandidates.find((candidate) => fs.existsSync(candidate))

if (!root) {
  console.log(`No Quartz output directory found. Checked: ${rootCandidates.join(", ")}`)
  process.exit(0)
}

let changedFiles = 0

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      let html = fs.readFileSync(fullPath, "utf8")
      const original = html
      for (const [from, to] of replacements) {
        html = html.split(from).join(to)
      }
      if (html !== original) {
        changedFiles += 1
        fs.writeFileSync(fullPath, html)
      }
    }
  }
}

walk(root)
console.log(`Patched ${changedFiles} HTML files in ${root}`)
