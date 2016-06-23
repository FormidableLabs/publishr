#!/usr/bin/env node

import postpublish from "./postpublish";
import postversion from "./postversion";


const main = (cmd) => {
  if (cmd === "postpublish") {
    postpublish();
  } else if (cmd === "postversion") {
    postversion();
  } else {
    throw new Error(`Unknown command: ${cmd}`);
  }
};

/* istanbul ignore if */
if (require.main === module) {
  main(process.argv[2]);
}

export default main;
