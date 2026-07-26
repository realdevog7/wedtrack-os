const fs = require('fs');
const content = fs.readFileSync('src/pages/Onboarding.tsx', 'utf8');
const newContent = content.replace(/\\`/g, '`');
fs.writeFileSync('src/pages/Onboarding.tsx', newContent);
console.log('Fixed backticks.');
