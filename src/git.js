import {exec} from "child_process";
import {Promise} from "es6-promise";
import logger from "./logger";


const git = {
  dry: false,

  checkout(filePath) {
    return new Promise((resolve, reject) => {
      git.exec(`git checkout ${filePath}`, (err, stdout) => {
        if (err) {
          logger.error(`checkout '${filePath}'`, err);

          return reject(err);
        }

        logger.success(`checkout '${filePath}'`);

        return resolve(stdout);
      });
    });
  },

  exec(cmd, cb) {
    if (git.dry) {
      exec("git status", cb);
    } else {
      exec(cmd, cb);
    }
  },

  enableDry() {
    git.dry = true;
  },

  disableDry() {
    git.dry = false;
  }
};

export default git;
