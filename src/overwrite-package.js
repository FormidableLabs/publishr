import {Promise} from "es6-promise";
import fs from "fs";
import handlePackage from "./handle-package";


const overwritePackage = (json, files) => {
  return new Promise((resolve, reject) => {
    handlePackage.updateDependencies(json);
    handlePackage.updateMeta(json, files);

    fs.writeFile("package.json", JSON.stringify(json, null, 2), "utf8", (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
};

export default overwritePackage;
