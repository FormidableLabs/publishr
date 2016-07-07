import logger from "./logger";


const errorHandler = {
  onError(err) {
    logger.enable();
    logger.error(`${err.stack || err.toString()}\n`);
  },

  dryRunnerError(err) {
    errorHandler.onError(err);

    logger.info([
      "Something unexpected happened during 'dry-run'.",
      "Make sure to address the error above before attemping 'dry-run' again.\n"
    ].join("\n"));
  },

  postpublishError(err) {
    errorHandler.scriptError(err, "postpublish");
  },

  postversionError(err) {
    errorHandler.scriptError(err, "postversion");
  },

  scriptError(err, script) {
    errorHandler.onError(err);

    logger.info([
      `Something unexpected happened during '${script}'.`,
      "Check the error above for more information.",
      "Run 'git status' to see if anything looks out of place.",
      "Check 'package.json' and files defined in the publishr config.",
      "Each file may need to be manually checked out or deleted.",
      `Make sure 'dry-run' passes before attempting '${script}' again.\n`
    ].join("\n"));
  }
};

export default errorHandler;
