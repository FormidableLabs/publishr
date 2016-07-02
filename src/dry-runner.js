import chalk from "chalk";
import childProcess from "child_process";
import {Promise} from "es6-promise";
import fileUtils from "./file-utils";
import mockfs from "mock-fs";
import postpublish from "./postpublish";
import postversion from "./postversion";


const dryRunner = {
  afterDryRun() {
    dryRunner.restoreFileSystem();
    dryRunner.restoreFunctions();

    return Promise.resolve();
  },

  beforeDryRun(packageJSON) {
    dryRunner.patchFileSystem(packageJSON);
    dryRunner.patchFunctions();

    return Promise.resolve();
  },

  logFail(message, err) {
    console.log(`${chalk.red("FAIL")} ${chalk.white(message)}`); //eslint-disable-line no-console

    if (err && err.message) {
      console.log(`${chalk.red(err.message)}`); //eslint-disable-line no-console
    }
  },

  logInfo(message) {
    console.log(chalk.grey(message)); //eslint-disable-line no-console
  },

  logPass(message) {
    console.log(`${chalk.green("PASS")} ${chalk.white(message)}`); //eslint-disable-line no-console
  },

  logPromise(fn, message, ...args) {
    return new Promise((resolve, reject) => {
      fn(...args).then((result) => {
        dryRunner.logPass(message);
        resolve(result);
      }).catch((err) => {
        dryRunner.logFail(message, err);
        reject(err);
      });
    });
  },

  patchFileSystem(packageJSON) {
    mockfs({
      "package.json": JSON.stringify(packageJSON, null, 2),
      ".npmignore.publishr": "mock contents"
    });
  },

  patchFunctions() {
    dryRunner.patch(childProcess, "exec", (cmd, cb) => {
      cb();
    });
    dryRunner.patch(fileUtils, "checkoutFile", (filePath) => {
      return dryRunner.logPromise(fileUtils.checkoutFile.original, `checkout ${filePath}`, filePath);
    });
    dryRunner.patch(fileUtils, "readFile", (filePath) => {
      return dryRunner.logPromise(fileUtils.readFile.original, `read ${filePath}`, filePath);
    });
    dryRunner.patch(fileUtils, "removeFile", (filePath) => {
      return dryRunner.logPromise(fileUtils.removeFile.original, `remove ${filePath}`, filePath);
    });
    dryRunner.patch(fileUtils, "writeFile", (filePath) => {
      return dryRunner.logPromise(fileUtils.writeFile.original, `write ${filePath}`, filePath);
    });
  },

  restoreFileSystem() {
    mockfs.restore();
  },

  restoreFunctions() {
    dryRunner.patches.forEach((fn) => {
      fn.restore();
    });
  },

  patch(obj, key, patch) {
    patch.original = obj[key];
    patch.restore = () => {
      obj[key] = patch.original;
    };
    obj[key] = patch;
    dryRunner.patches.push(patch);
  },

  patches: [],

  postpublish(result) {
    dryRunner.logInfo("Validating postpublish script...");

    return postpublish();
  },

  postversion() {
    dryRunner.logInfo("Validating postversion script...");

    return postversion();
  },

  run() {
    return fileUtils
      .readPackage()
      .then(dryRunner.beforeDryRun)
      .then(dryRunner.postversion)
      .then(dryRunner.postpublish)
      .then(dryRunner.afterDryRun);
  }
};

export default dryRunner;
