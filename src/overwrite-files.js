import fs from 'fs';


export default function overwriteFiles(json) {
  Object.keys(json.publishr.files).forEach((key) => {
    fs.readFile(json.publishr.files[key], 'utf8', (readErr, contents) => {
      if (readErr) {
        console.log('READ ERROR FILES');

        return;
      }

      fs.writeFile(key, contents, 'utf8', (writeErr) => {
        if (writeErr) {
          console.log('WRITE ERROR FILES');
        }
      });
    });
  });

  fs.writeFile('package.json', JSON.stringify(json, null, 2), 'utf8', (writeErr) => {
    if (writeErr) {
      console.log('WRITE ERROR FILES');
    }
  });
}
