import { Promise } from "es6-promise";
import fs from "fs";


const testHelpers = {
  fileExists(filePath) {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (err) => {
        if (err && err.code === "ENOENT") {
          resolve(false);
        } else if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  }
};

export default testHelpers;
