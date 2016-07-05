import {exec} from "child_process";
import logger from "./logger";


const git = {
  exec: exec,

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

  disableDryRun() {
    git.exec = exec;
  },

  enableDryRun(fn) {
    git.exec = fn;
  }
};

export default git;
