// scripts/prebuild.js
const fs = require("fs")
const path = require("path")

const dbDir = path.join(process.cwd(), "tmp")

if (!fs.existsSync(dbDir)) {
	fs.mkdirSync(dbDir, { recursive: true })
	console.log("📁 Created ./tmp directory")
} else {
	console.log("✅ ./tmp directory already exists")
}
