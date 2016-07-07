import logger from "./logger";


const errorHandler = {
  messages: {
    checkFiles: "Check 'package.json' and files defined in the publishr config.",
    checkErrors: "Check the errors above for more information.",
    dryRunPass: "Make sure 'dry-run' passes before reattempting '%s'.",
    fixFiles: "Each file may need to be manually checked out or deleted.",
    gitStatus: "Run 'git status' to see if anything is out of place.",
    unexpected: "Something unexpected happend during '%s'."
  },

  onError(err) {
    logger.enable();
    logger.error(`${err.stack || err.toString()}\n`);
  },

  dryRunnerError(err) {
    errorHandler.onError(err);

    logger.info(errorHandler.messages.unexpected, "dry-run");
    logger.info(errorHandler.messages.checkErrors);
    logger.info("Make sure to address all errors before reattemping 'dry-run'.");
  },

  postpublishError(err) {
    errorHandler.onError(err);

    logger.info(errorHandler.messages.unexpected, "postpublish");
    logger.info(errorHandler.messages.checkErrors);
    logger.info(errorHandler.messages.gitStatus);
    logger.info(errorHandler.messages.checkFiles);
    logger.info(errorHandler.messages.fixFiles);
    logger.info(errorHandler.messages.dryRunPass, "publish");
  },

  postversionError(err) {
    errorHandler.onError(err);

    logger.info(errorHandler.messages.unexpected, "postversion");
    logger.info(errorHandler.messages.checkErrors);
    logger.info(errorHandler.messages.gitStatus);
    logger.info(errorHandler.messages.checkFiles);
    logger.info(errorHandler.messages.fixFiles);
    logger.info("Do not attempt to 'publish' until all errors are addressed.");
    logger.info(errorHandler.messages.dryRunPass, "version");
  }
};

export default errorHandler;
