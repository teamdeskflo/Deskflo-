const fs = require('fs');
const path = require('path');

const dashboardDir = './src/app/dashboard';

function walkSync(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(walkSync(full));
    } else if (full.endsWith('.tsx')) {
      files.push(full);
    }
  });
  return files;
}

const files = walkSync(dashboardDir);

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Fix primary buttons: background var(--text-primary) + color: 'white'
  //    In dark mode text-primary is cream/light, making white text invisible.
  //    Replace with our accent color (dark-mode safe) + white text
  content = content.replaceAll(
    "background: 'var(--text-primary)', color: 'white'",
    "background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)'"
  );

  // 2. Fix onMouseLeave that resets to 'white' background (should be transparent)
  content = content.replaceAll(
    "e.currentTarget.style.background = 'white'",
    "e.currentTarget.style.background = 'transparent'"
  );

  // 3. Fix filter dropdown items that use 'white' as unselected background
  content = content.replaceAll(
    "? 'var(--content-bg)' : 'white'",
    "? 'var(--content-bg)' : 'var(--card-bg)'"
  );
  
  // 4. Fix isExpanded toggle that uses 'white'
  content = content.replaceAll(
    "? 'white' : 'var(--content-bg)'",
    "? 'var(--card-bg)' : 'var(--content-bg)'"
  );
  content = content.replaceAll(
    "isExpanded && (e.currentTarget.style.background = 'white')",
    "isExpanded && (e.currentTarget.style.background = 'transparent')"
  );
  content = content.replaceAll(
    "!isExpanded && (e.currentTarget.style.background = 'white')",
    "!isExpanded && (e.currentTarget.style.background = 'transparent')"
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated: ' + filePath);
  }
});

console.log('Done fixing colors!');
