import {Promise} from "es6-promise";
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
  },

  readFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, contents) => {
        if (err) {
          return reject(err);
        }

        return resolve(contents);
      });
    });
  }
};

export default testHelpers;
