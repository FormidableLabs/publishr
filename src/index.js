import {exec} from 'child_process';
import fs from 'fs';
import objectAssign from 'object-assign';


function replaceFiles(files) {
    Object.keys(files).forEach((key) => {
        fs.readFile(files[key], 'utf8', (readErr, contents) => {
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

function replaceDependencies(patterns, json) {
    const depKeys = Object.keys(json.dependencies);

    json.devDependencies = objectAssign({}, json.devDependencies);
    patterns.forEach((pattern) => {
        const regex = new RegExp(pattern);

        depKeys.filter(
            (key) => regex.test(key)
        ).forEach((key) => {
            json.devDependencies[key] = json.dependencies[key];
        });

        json.dependencies = depKeys.filter(
            (key) => !regex.test(key)
        ).reduce((result, key) => {
            result[key] = json.dependencies[key];

            return result;
        }, {});
    });
}

function addScripts(json) {
    json.scripts = objectAssign({}, json.scripts);
    json.scripts.postpublish = [
        'echo postpublishadded',
        json.scripts.postversion
    ].filter((cmd) => cmd).join(' && ');
    json.scripts.postversion = [
        'echo postversionadded',
        json.scripts.postversion
    ].filter((cmd) => cmd).join(' && ');
}

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
