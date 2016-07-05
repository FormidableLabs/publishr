import {exec} from "child_process";
import {Promise} from "es6-promise";
import fileUtils from "./file-utils";
import fs from "fs";
import git from "./git";
import logger from "./logger";
import postpublish from "./postpublish";
import postversion from "./postversion";


let mockfs;

const dryRunner = {
  afterDryRun() {
    logger.disable();
    git.disableDryRun();
    dryRunner.restoreFileSystem();

    return Promise.resolve();
  },

  beforeDryRun() {
    logger.enable();
    git.enableDryRun(dryRunner.validateCheckout);
    logger.info("Validating configuration...");

    return fileUtils
      .readPackage()
      .then(dryRunner.validatePackage)
      .then(dryRunner.validateFiles)
      .then((result) => {
        dryRunner.patchFileSystem(result.json, result.files);

        return Promise.resolve();
      });
  },

  patchFileSystem(packageJSON, files) {
    mockfs = require("mock-fs");

    const fileSystem = files.reduce((result, filePath) => {
      result[filePath] = `${filePath} contents`;

      return result;
    }, {
      "package.json": JSON.stringify(packageJSON, null, 2)
    });

    mockfs(fileSystem);
  },

  postpublish() {
    logger.info("Validating postpublish...");

    return postpublish.run();
  },

  postversion() {
    logger.info("Validating postversion...");

    return postversion.run();
  },

  restoreFileSystem() {
    mockfs.restore();
  },

  run() {
    return dryRunner
      .beforeDryRun()
      .then(dryRunner.postversion)
      .then(dryRunner.postpublish)
      .then(dryRunner.afterDryRun);
  },

  validateCheckout(cmd, cb) {
    return new Promise((resolve, reject) => {
      const filePath = cmd.split(" ").pop();

      exec(`git status ${filePath}`, (err, stdout, stderr) => {
        if (err) {
          return cb(err, stdout, stderr);
        }

        console.log(stdout);

        cb(err, stdout, stderr);
      });
    });
  },

  validateFiles(packageJSON) {
    const filePaths = packageJSON.publishr.files || {};

    return Promise.all(Object.keys(filePaths).map((filePath) => {
      return new Promise((resolve, reject) => {
        const oldPath = filePaths[filePath];

        fs.stat(oldPath, (err) => {
          if (err) {
            logger.error(`validate '${oldPath}'`, err);

            return reject(err);
          }

          logger.success(`validate '${oldPath}'`);

          return resolve(oldPath);
        });
      });
    })).then((validFiles) => {

      return Promise.resolve({
        files: validFiles,
        json: packageJSON
      });
    });
  },

  validatePackage(packageJSON) {
    let err;

    if (!packageJSON || !packageJSON.publishr) {
      err = new Error("No publishr configuration in 'package.json'");
    } else if (!packageJSON.publishr.dependencies && !packageJSON.publishr.files) {
      err = new Error("No files or dependencies in publishr configuration");
    }

    if (err) {
      logger.error("validate 'package.json'", err);

      return Promise.reject(err);
    }

    logger.success("validate 'package.json'");

    return Promise.resolve(packageJSON);
  }
};

export default dryRunner;
