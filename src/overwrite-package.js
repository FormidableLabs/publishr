import {Promise} from "es6-promise";
import fs from "fs";
import packageUtils from "./package-utils";


const overwritePackage = (json, files) => {
  return new Promise((resolve, reject) => {
    packageUtils.updateDependencies(json);
    packageUtils.updateMeta(json, files);

    fs.writeFile("package.json", JSON.stringify(json, null, 2), "utf8", (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
};

export default overwritePackage;
