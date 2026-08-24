const fs = require('fs');
const files = [
  'server/db.ts',
  'server/routes/community.ts',
  'server/routes/auth.ts'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/"student"/g, '"member"');
  fs.writeFileSync(file, content);
});
