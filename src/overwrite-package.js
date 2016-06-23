import fs from "fs";
import objectAssign from "object-assign";
import {Promise} from "es6-promise";


const updateDependencies = (json) => {
  const dependencyKeys = Object.keys(json.dependencies);

  json.devDependencies = objectAssign({}, json.devDependencies);
  json.publishr.dependencies.forEach((str) => {
    const regex = new RegExp(str);

    dependencyKeys.filter(
      (key) => regex.test(key)
    ).forEach((key) => {
      json.devDependencies[key] = json.dependencies[key];
    });

    json.dependencies = dependencyKeys.filter(
      (key) => !regex.test(key)
    ).reduce((result, key) => {
      result[key] = json.dependencies[key];

      return result;
    }, {});
  });
};

const updateStats = (json, files) => {
  json._publishr = files.map((file) => ({
    created: file.created,
    path: file.newPath
  }));
  json._publishr.push({
    created: false,
    path: "package.json"
  });
};

const overwritePackage = (json, files) => {
  return new Promise((resolve, reject) => {
    updateDependencies(json);
    updateStats(json, files);

    fs.writeFile("package.json", JSON.stringify(json, null, 2), "utf8", (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
};

export default overwritePackage;
