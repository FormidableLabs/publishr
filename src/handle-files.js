import fs from "fs";
import {Promise} from "es6-promise";


const handleFiles = {
  read(files) {
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

  stat(files) {
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

  write(files) {
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
  }
};

export default handleFiles;
