import {exec} from "child_process";
import {Promise} from "es6-promise";
import fs from "fs";


const fileUtils = {
  checkoutFile(filePath) {
    return new Promise((resolve, reject) => {
      exec(`git checkout ${filePath}`, (err, stdout) => {
        if (err) {
          return reject(err);
        }

        return resolve(stdout);
      });
    });
  },

  readFiles(files) {
    return Promise.all(files.map((file) => {
      return new Promise((resolve, reject) => {
        fs.readFile(file.oldPath, "utf8", (err, contents) => {
          if (err) {
            return reject(err);
          }

          file.contents = contents;

          return resolve(file);
        });
      });
    }));
  },

  readPackage() {
    return new Promise((resolve, reject) => {
      fs.readFile("package.json", "utf8", (err, contents) => {
        if (err) {
          return reject(err);
        }

        return resolve(JSON.parse(contents));
      });
    });
  },

  removeFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    });
  },

  statFiles(files) {
    return Promise.all(files.map((file) => {
      return new Promise((resolve, reject) => {
        fs.stat(file.newPath, (err) => {
          if (err && err.code !== "ENOENT") {
            return reject(err);
          } else if (!err) {
            file.created = false;
          } else {
            file.created = true;
          }

          return resolve(file);
        });
      });
    }));
  },

  writeFiles(files) {
    return Promise.all(files.map((file) => {
      return new Promise((resolve, reject) => {
        fs.writeFile(file.newPath, file.contents, "utf8", (err) => {
          if (err) {
            return reject(err);
          }

          file.written = true;

          return resolve(file);
        });
      });
    }));
  },

  writePackage(json) {
    return new Promise((resolve, reject) => {
      fs.writeFile("package.json", JSON.stringify(json, null, 2), "utf8", (err) => {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    });
  }
};

export default fileUtils;