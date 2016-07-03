
import childProcess from "child_process";
import {Promise} from "es6-promise";
import fileUtils from "./file-utils";
import logger from "./logger";
import mockfs from "mock-fs";
import postpublish from "./postpublish";
import postversion from "./postversion";


const exec = childProcess.exec;

const dryRunner = {
  afterDryRun() {
    childProcess.exec = exec;
    logger.silent = true;

    return dryRunner.restoreFileSystem();
  },

  beforeDryRun() {
    childProcess.exec = dryRunner.dryExec;
    logger.silent = false;
    logger.info("Validating configuration...");

    return fileUtils
      .readPackage()
      .then(dryRunner.validatePackage)
      .then(dryRunner.patchFileSystem);
  },

  dryExec(filePath, cb) {
    cb();
  },

  patchFileSystem(packageJSON) {
    const files = packageJSON.publishr.files || {};
    const fileSystem = Object.keys(files).reduce((result, file) => {
      result[files[file]] = `${files[file]} contents`;

      return result;
    }, {
      "package.json": JSON.stringify(packageJSON, null, 2)
    });

    mockfs(fileSystem);

    return Promise.resolve();
  },

  postpublish(result) {
    logger.info("Validating postpublish...");

    return postpublish();
  },

  postversion() {
    logger.info("Validating postversion...");

    return postversion();
  },

  restoreFileSystem() {
    mockfs.restore()

    return Promise.resolve();
  },

  run() {
    return dryRunner
      .beforeDryRun()
      .then(dryRunner.postversion)
      .then(dryRunner.postpublish)
      .then(dryRunner.afterDryRun);
  },

  validatePackage(packageJSON) {
    let err;

    if (!packageJSON || !packageJSON.publishr) {
      err = new Error("No valid publishr configuration in package.json");
      logger.error("validate package.json", err);
    } else {
      logger.success("validate package.json");
    }

    return err ? Promise.reject(err) : Promise.resolve(packageJSON);
  }
};

export default dryRunner;
