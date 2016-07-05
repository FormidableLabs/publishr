import {exec} from "child_process";
import {Promise} from "es6-promise";
import fs from "fs";
import logger from "./logger";


const fileUtils = {
  checkoutFile(filePath) {
    return new Promise((resolve, reject) => {
      exec(`git checkout ${filePath}`, (err, stdout) => {
        if (err) {
          logger.error(`checkout '${filePath}'`, err);

          return reject(err);
        }

        logger.success(`checkout '${filePath}'`);

        return resolve(stdout);
      });
    });
  },

  readFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, contents) => {
        if (err) {
          logger.error(`read '${filePath}'`, err);

          return reject(err);
        }

        logger.success(`read '${filePath}'`);

        return resolve(contents);
      });
    });
  },

  readFiles(files) {
    return Promise.all(files.map((file) => {
      return fileUtils.readFile(file.oldPath).then((contents) => {
        file.contents = contents;

        return Promise.resolve(file);
      });
    }));
  },

  readPackage() {
    return fileUtils
      .readFile("package.json")
      .then((contents) => Promise.resolve(JSON.parse(contents)));
  },

  removeFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error(`remove '${filePath}'`, err);

          return reject(err);
        }

        logger.success(`remove '${filePath}'`);

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

  writeFile(filePath, contents) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, contents, "utf8", (err) => {
        if (err) {
          logger.error(`write '${filePath}'`, err);

          return reject(err);
        }

        logger.success(`write '${filePath}'`);

        return resolve();
      });
    });
  },

  writeFiles(files) {
    return Promise.all(files.map((file) => {
      return fileUtils.writeFile(file.newPath, file.contents).then(() => {
        file.written = true;

        return Promise.resolve(file);
      });
    }));
  },

  writePackage(json) {
    let contents;

    try {
      contents = JSON.stringify(json, null, 2);
    } catch (err) {
      return Promise.reject(err);
    }

    return fileUtils.writeFile("package.json", contents);
  }
};

export default fileUtils;
