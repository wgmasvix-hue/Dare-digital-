import fs from 'fs';

const filePath = './agris_seed.sql';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const updatedLines = lines.map(line => {
  // Fix the column list line
  if (line.startsWith('INSERT INTO public.books')) {
    // Remove any previous attempts to add source/institution_id if they exist
    let cleanLine = line.replace(', source, institution_id', '');
    return cleanLine.replace('format)', 'format, source, institution_id)');
  }
  
  // Fix the VALUES line
  if (line.startsWith('VALUES')) {
    // First, let's try to clean up the mess from the previous script
    // The previous script inserted ", 'AGRIS', 'agris-fao')" at the first ")"
    // We want to find the REAL end of the values, which is the last ")" before the end of the line (or before ON CONFLICT if it was on the same line, but here it's on the next line)
    
    // Let's extract the ID and other fields if possible, or just find the last 'pdf')
    // Actually, the simplest way to fix the broken lines is to remove the incorrectly inserted string.
    // The broken lines look like: ... some text, 'AGRIS', 'agris-fao') more text ... 'pdf')
    
    let fixedLine = line.replace(", 'AGRIS', 'agris-fao')", "");
    
    // Now add it correctly at the end
    if (fixedLine.endsWith("'pdf')")) {
      return fixedLine.replace("'pdf')", "'pdf', 'AGRIS', 'agris-fao')");
    }
    return fixedLine;
  }
  
  return line;
});

fs.writeFileSync(filePath, updatedLines.join('\n'));
console.log('Fixed agris_seed.sql successfully.');
