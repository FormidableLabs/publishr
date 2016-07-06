import {Promise} from "es6-promise";
import fileUtils from "./file-utils";
import git from "./git";
import logger from "./logger";
import postpublish from "./postpublish";
import postversion from "./postversion";


let mockfs;

const dryRunner = {
  afterDryRun() {
    logger.disable();
    git.disableDry();
    dryRunner.restoreFileSystem();

    return Promise.resolve();
  },

  beforeDryRun() {
    logger.enable();
    git.enableDry();
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

    const fileSystem = files.reduce((result, file) => {
      result[file.path] = mockfs.file({
        content: `${file.path} contents`,
        mode: file.stats.mode
      });

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

  validateFileOperation(filePath) {
    return fileUtils.statFile(filePath).then((stats) => {
      logger.pass(`validate ${filePath}`);

      return Promise.resolve({
        path: filePath,
        stats
      });
    });
  },

  validateFileRead(filePath) {
    return dryRunner.validateFileOperation(filePath).catch((err) => {
      logger.fail(`validate ${filePath}`, err);

      return Promise.reject(err);
    });
  },

  validateFiles(packageJSON) {
    const files = packageJSON.publishr.files || {};
    const filePaths = Object.keys(files);
    const fileReads = filePaths.map((filePath) => {
      return dryRunner.validateFileRead(files[filePath]);
    });
    const fileWrites = filePaths.map((filePath) => {
      return dryRunner.validateFileWrite(filePath);
    });
    const fileOperations = [].concat(fileReads, fileWrites);

    return Promise.all(fileOperations).then((validFiles) => {
      return Promise.resolve({
        files: validFiles.filter((file) => file),
        json: packageJSON
      });
    });
  },

  validateFileWrite(filePath) {
    return dryRunner.validateFileOperation(filePath).catch((err) => {
      if (err.code !== "ENOENT") {
        logger.pass(`validate ${filePath}`, err);

        return Promise.reject(err);
      }

      logger.pass(`validate ${filePath}`);

      return Promise.resolve();
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
      logger.fail("validate 'package.json'", err);

      return Promise.reject(err);
    }

    logger.pass("validate 'package.json'");

    return Promise.resolve(packageJSON);
  }
};

export default dryRunner;
