// Rename all uploaded recording files to add .webm extension if missing
// Run with: node rename-recordings.js

const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'backend', 'uploads');
const metadataPath = path.join(uploadsDir, 'recordings-metadata.json');

// Load metadata
let metadata = [];
try {
  metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
} catch (err) {
  console.error('Failed to read metadata:', err);
  process.exit(1);
}

let renamed = 0;
for (const entry of metadata) {
  const baseName = entry.filename.replace(/\.webm$/, '');
  const oldPath = path.join(uploadsDir, baseName);
  const newPath = path.join(uploadsDir, baseName + '.webm');

  if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${baseName} -> ${baseName}.webm`);
    renamed++;
  }
}

console.log(`Done. Renamed ${renamed} files.`);
