import {exec} from 'child_process';
import fs from 'fs';
import objectAssign from 'object-assign';


function writePackageJSON(json) {
    fs.writeFile('package.json', JSON.stringify(json, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
            console.log('WRITE ERROR FILES');
        }
    });
}

function publish() {
    exec(`npm version patch`, (err, stdout, stderr) => {
        console.log(stdout);
    });
}

const packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const options = packageJSON.publishr;


//replaceFiles(options.files);
replaceDependencies(options.dependencies, packageJSON);
addScripts(packageJSON);
//writePackageJSON(packageJSON);
//publish();
