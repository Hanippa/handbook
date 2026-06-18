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
  [
    "../.././assets/images/open-repair-ticket/",
    "https://raw.githubusercontent.com/Hanippa/handbook/gh-pages/assets/images/open-repair-ticket/",
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
const lightModeScript = `
try {
  if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "light")
  }
  document.documentElement.setAttribute("saved-theme", localStorage.getItem("theme") || "light")
} catch {
  document.documentElement.setAttribute("saved-theme", "light")
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
      html = relativizeRootAssets(html, fullPath)
      if (html !== original) {
        changedFiles += 1
        fs.writeFileSync(fullPath, html)
      }
    }
  }
}

function relativizeRootAssets(html, fullPath) {
  const relativeFilePath = path.relative(root, fullPath).split(path.sep).join("/")
  const dir = path.posix.dirname(relativeFilePath)
  const prefix = dir === "." ? "" : `${path.posix.relative(dir, ".")}/`
  const homeHref = dir === "." ? "." : prefix.slice(0, -1)

  return html
    .split('href="/index.css"').join(`href="${prefix}index.css"`)
    .split('src="/prescript.js"').join(`src="${prefix}prescript.js"`)
    .split('src="/postscript.js"').join(`src="${prefix}postscript.js"`)
    .split('href="/static/').join(`href="${prefix}static/`)
    .split('fetch("/static/').join(`fetch("${prefix}static/`)
    .split('href="/">Handbook</a>').join(`href="${homeHref}">Handbook</a>`)
}

walk(root)

const cssPath = path.join(root, "index.css")
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, "utf8")
  if (!css.includes("direction: rtl")) {
    fs.writeFileSync(cssPath, `${css}${customCss}`)
  }
}

const prescriptPath = path.join(root, "prescript.js")
if (fs.existsSync(prescriptPath)) {
  let script = fs.readFileSync(prescriptPath, "utf8")
  if (!script.includes('localStorage.setItem("theme", "light")')) {
    script = `${lightModeScript}\n${script}`
  }
  script = script.replace(
    'var d=!1,a=n=>{let e=new CustomEvent("readermodechange"',
    'var d=!0,a=n=>{let e=new CustomEvent("readermodechange"',
  )
  if (script !== fs.readFileSync(prescriptPath, "utf8")) {
    fs.writeFileSync(prescriptPath, script)
  }
}

fs.writeFileSync(path.join(root, "CNAME"), `${customDomain}\n`)

console.log(`Patched ${changedFiles} HTML files in ${root}`)
