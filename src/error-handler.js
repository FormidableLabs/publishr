import logger from "./logger";


const errorHandler = {
  defaultError(err) {
    logger.enable();
    logger.error(`${err.stack || err.toString()}\n`);
  },

  dryRunnerError(err) {
    errorHandler.defaultError(err);

    logger.info([
      "Something unexpected happened during 'dry-run'.",
      "Make sure to address the error above before attemping 'dry-run' again.\n"
    ].join("\n"));
  },

  postpublishError(err) {
    errorHandler.postScriptError(err, "postpublish");
  },

  postversionError(err) {
    errorHandler.postScriptError(err, "postversion");
  },

  postScriptError(err, script) {
    errorHandler.defaultError(err);

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
