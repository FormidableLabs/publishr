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

    fs.writeFile('package.json', JSON.stringify(json, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
            console.log('WRITE ERROR FILES');
        }
    });
}

function publish() {
    console.log('PUBLISH');
}

const json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const options = json.publishr;


replaceFiles(options.files);
replaceDependencies(options.dependencies, json);
publish();
