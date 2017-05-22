import { exec } from "child_process";
import { Promise } from "es6-promise";
import logger from "./logger";


const git = {
  dry: false,

  checkout(filePath) {
    return new Promise((resolve, reject) => {
      git.exec(`git checkout ${filePath}`, (err, stdout) => {
        if (err) {
          logger.fail(`checkout '${filePath}'`, err);

          return reject(err);
        }

        logger.pass(`checkout '${filePath}'`);

        return resolve(stdout);
      });
    });
  },

  disableDry() {
    git.dry = false;
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
  }
};

export default git;
