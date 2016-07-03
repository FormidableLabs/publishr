import chalk from "chalk";
import symbols from "log-symbols";


const logger = {
  silent: true,

  error(message, err) {
    logger.log(`${symbols.error}  ${chalk.gray(message)}`);

    if (err && err.message) {
      logger.log(`${chalk.red(err.message)}`);
    }
  },

  info(message) {
    logger.log(chalk.white(message));
  },

  log(...args) {
    if (logger.silent) {
      return;
    }

    console.log(...args); // eslint-disable-line no-console
  },

  success(message) {
    logger.log(`${symbols.success}  ${chalk.gray(message)}`);
  }
};

export default logger;
