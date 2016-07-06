#!/usr/bin/env node

import args from "./args";
import dryRunner from "./dry-runner";
import logger from "./logger";
import postpublish from "./postpublish";
import postversion from "./postversion";


const main = () => {
  const argv = args.init().argv;
  const cmd = argv._[0];

  if (argv.verbose) {
    logger.enable();
  }

  if (cmd === "postversion") {
    postversion.run();
  } else if (cmd === "postpublish") {
    postpublish.run();
  } else if (cmd === "dry-run") {
    dryRunner.run();
  } else {
    args.showHelp();
  }
};

/* istanbul ignore if */
if (require.main === module) {
  main();
}

export default main;
