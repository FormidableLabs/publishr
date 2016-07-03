#!/usr/bin/env node

import dryRunner from "./dry-runner";
import postpublish from "./postpublish";
import postversion from "./postversion";


const main = (cmd) => {
  if (cmd === "postpublish") {
    postpublish.run();
  } else if (cmd === "postversion") {
    postversion.run();
  } else if (cmd === "dry-run") {
    dryRunner.run();
  } else {
    throw new Error(`Unknown command ${cmd}`);
  }
};

/* istanbul ignore if */
if (require.main === module) {
  main(process.argv[2]);
}

export default main;
