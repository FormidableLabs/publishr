import chalk from "chalk";
import logSymbols from "log-symbols";


const logger = {
  enabled: false,

  disable() {
    logger.enabled = false;
  },

  enable() {
    logger.enabled = true;
  },

  error(message) {
    if (logger.enabled) {
      console.error(chalk.red(message)); // eslint-disable-line no-console
    }
  },

  fail(message, err) {
    logger.log(`${logSymbols.error}  ${chalk.gray(message)}`);

    if (err && err.message) {
      logger.log(chalk.red(err.message));
    }
  },

  info(message) {
    logger.log(message);
  },

  log(...args) {
    if (logger.enabled) {
      console.log(...args); // eslint-disable-line no-console
    }
  },

  pass(message) {
    logger.log(`${logSymbols.success}  ${chalk.gray(message)}`);
  }
};

export default logger;
