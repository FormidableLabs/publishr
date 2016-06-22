#!/usr/bin/env node

import postpublish from "./postpublish";
import postversion from "./postversion";


const cmd = process.argv[2];

if (cmd === "postpublish") {
  postpublish();
} else if (cmd === "postversion") {
  postversion();
}
