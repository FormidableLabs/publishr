import fs from 'fs';


function replaceFiles(json) {
    Object.keys(json.publishr.files).forEach((key) => {
        fs.readFile(json.publishr.files[key], 'utf8', (readErr, contents) => {
            if (readErr) {
                console.log('READ ERROR FILES');
            } else {
                fs.writeFile(key, contents, 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.log('WRITE ERROR FILES');
                    }
                });
            }
        });
    });
}

export default replaceFiles;