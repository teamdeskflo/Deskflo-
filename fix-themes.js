const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // backgrounds
    content = content.replace(/background:\s*'white'/g, "background: 'var(--card-bg)'");
    content = content.replace(/background:\s*"white"/g, "background: 'var(--card-bg)'");
    content = content.replace(/background:\s*'#FFF'/ig, "background: 'var(--card-bg)'");
    content = content.replace(/background:\s*"#FFFFFF"/ig, "background: 'var(--card-bg)'");
    content = content.replace(/background:\s*'#FFFFFF'/ig, "background: 'var(--card-bg)'");
    content = content.replace(/background:\s*'#F9FAFB'/ig, "background: 'var(--content-bg)'");
    content = content.replace(/background:\s*'#F1F0E8'/ig, "background: 'var(--border-light)'");
    content = content.replace(/background:\s*'#E2E8F0'/ig, "background: 'var(--border)'");
    content = content.replace(/background:\s*'#EAEBE6'/ig, "background: 'var(--border-light)'");

    // colors
    content = content.replace(/color:\s*'#1F2937'/ig, "color: 'var(--text-primary)'");
    content = content.replace(/color:\s*"#1F2937"/ig, "color: 'var(--text-primary)'");
    content = content.replace(/color:\s*'#4B5563'/ig, "color: 'var(--text-secondary)'");
    content = content.replace(/color:\s*'#6B7280'/ig, "color: 'var(--text-muted)'");
    content = content.replace(/color:\s*'#9CA3AF'/ig, "color: 'var(--text-muted)'");

    // Icon colors (Lucide)
    content = content.replace(/color="#1F2937"/ig, "color=\"currentColor\"");
    content = content.replace(/color="#4B5563"/ig, "color=\"currentColor\"");
    content = content.replace(/color="#6B7280"/ig, "color=\"currentColor\"");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
