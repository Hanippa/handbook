const fs = require("fs")
const path = require("path")

const root = "public"
const replacements = new Map([
  [
    "../../handbook/guru/assets/images/open-repair-ticket/",
    "https://raw.githubusercontent.com/Hanippa/handbook/gh-pages/guru/assets/images/open-repair-ticket/",
  ],
  [
    "../.././assets/images/open-repair-ticket/",
    "https://raw.githubusercontent.com/Hanippa/handbook/gh-pages/guru/assets/images/open-repair-ticket/",
  ],
])

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      let html = fs.readFileSync(fullPath, "utf8")
      for (const [from, to] of replacements) {
        html = html.split(from).join(to)
      }
      fs.writeFileSync(fullPath, html)
    }
  }
}

walk(root)
