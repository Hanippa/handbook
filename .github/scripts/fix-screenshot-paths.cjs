const fs = require("fs")
const path = require("path")

const rootCandidates = [
  process.env.QUARTZ_OUTPUT_DIR,
  "public",
  "_site",
].filter(Boolean)
const customDomain = "demo.dekel.bio"
const replacements = new Map([
  ['<html lang="en" dir="ltr">', '<html lang="he" dir="rtl">'],
  ['<html lang="en">', '<html lang="he" dir="rtl">'],
  ['href="../../index.css"', 'href="/index.css"'],
  ['href="../index.css"', 'href="/index.css"'],
  ['href="index.css"', 'href="/index.css"'],
  ['src="../../prescript.js"', 'src="/prescript.js"'],
  ['src="../prescript.js"', 'src="/prescript.js"'],
  ['src="prescript.js"', 'src="/prescript.js"'],
  ['src="../../postscript.js"', 'src="/postscript.js"'],
  ['src="../postscript.js"', 'src="/postscript.js"'],
  ['src="postscript.js"', 'src="/postscript.js"'],
  ['href="../../static/', 'href="/static/'],
  ['href="../static/', 'href="/static/'],
  ['href="static/', 'href="/static/'],
  ['fetch("../../static/', 'fetch("/static/'],
  ['fetch("../static/', 'fetch("/static/'],
  ['fetch("static/', 'fetch("/static/'],
  ['href="../..">Handbook</a>', 'href="/">Handbook</a>'],
  ['href="..">Handbook</a>', 'href="/">Handbook</a>'],
  ['href=".">Handbook</a>', 'href="/">Handbook</a>'],
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
const customCss = `

body,
.page,
.popover-hint,
article,
main {
  direction: rtl;
  text-align: right;
}

ul,
ol {
  padding-right: 1.5rem;
  padding-left: 0;
}

li.task-list-item {
  padding-right: 0.2rem;
  padding-left: 0;
}

pre,
code,
kbd,
samp {
  direction: ltr;
  text-align: left;
}

img {
  max-width: 100%;
  height: auto;
}
`

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

const cssPath = path.join(root, "index.css")
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, "utf8")
  if (!css.includes("direction: rtl")) {
    fs.writeFileSync(cssPath, `${css}${customCss}`)
  }
}

fs.writeFileSync(path.join(root, "CNAME"), `${customDomain}\n`)

console.log(`Patched ${changedFiles} HTML files in ${root}`)
