import yargs from "yargs";


const args = {
  init() {
    return yargs
      .usage("Usage: publishr <command> [options]")
      .command("dry-run", "Perform a dry run of postversion and postpublish")
      .command("postpublish", "Clean up any actions taken by postversion")
      .command("postversion", "Create and overwrite files for publishing")
      .help().alias("h", "help")
      .option("verbose", {
        describe: "Log each step during postversion/postpublish",
        type: "boolean"
      }).alias("V", "verbose")
      .version().alias("v", "version");
  },

  showHelp() {
    yargs.showHelp();
  }
};

export default args;
