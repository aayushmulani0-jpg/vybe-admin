const fs = require('fs');
const path = require('path');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove background color hardcoding
  content = content.replace(/backgroundColor:\s*['"]#(141414|1a1a1a|000|000000)['"]\s*,?/g, '');
  content = content.replace(/background:\s*['"]#(141414|1a1a1a|000|000000)['"]\s*,?/g, '');
  
  // Remove text color hardcoding
  content = content.replace(/color:\s*['"]#(fff|ffffff|888|666)['"]\s*,?/g, '');
  
  // Remove border color hardcoding
  content = content.replace(/borderColor:\s*['"]#(333|f0f0f0)['"]\s*,?/g, '');

  // Clean up empty style objects like style={{ }} or style={{  }}
  content = content.replace(/style=\{\{\s*\}\}/g, '');
  
  // Clean up dangling commas in style objects like style={{ width: 100,  }}
  content = content.replace(/,\s*\}/g, '}');
  
  fs.writeFileSync(filePath, content);
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(process.cwd(), 'src'));
files.forEach(fullPath => {
  if (!fullPath.includes('store') && !fullPath.includes('App.jsx') && !fullPath.includes('Header.jsx') && !fullPath.includes('main.jsx')) {
    cleanFile(fullPath);
  }
});
console.log('Cleanup complete');
