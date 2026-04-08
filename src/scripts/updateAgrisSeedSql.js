import fs from 'fs';
import path from 'path';

const filePath = './agris_seed.sql';
if (!fs.existsSync(filePath)) {
  console.error('File not found: ' + filePath);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf-8');

// Update column list
content = content.replace(
  /INSERT INTO public\.books \((.*?)\)/g,
  'INSERT INTO public.books ($1, source, institution_id)'
);

// Update values list
// We need to be careful here. The values list ends with a closing parenthesis before the ON CONFLICT or the next INSERT.
// Pattern: VALUES ('...', '...', NULL, ..., 'pdf')
// We want to change it to: VALUES ('...', '...', NULL, ..., 'pdf', 'AGRIS', 'agris-fao')
content = content.replace(
  /VALUES \((.*?)\)/g,
  "VALUES ($1, 'AGRIS', 'agris-fao')"
);

fs.writeFileSync(filePath, content);
console.log('Updated agris_seed.sql successfully.');
