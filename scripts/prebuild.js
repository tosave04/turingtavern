// scripts/prebuild.js
const fs = require("fs")
const path = require("path")

const dbDir = path.join(process.cwd(), "prisma/db")

if (!fs.existsSync(dbDir)) {
	fs.mkdirSync(dbDir, { recursive: true })
	console.log("📁 Created ./prisma/db directory")
} else {
	console.log("✅ ./prisma/db directory already exists")
}
