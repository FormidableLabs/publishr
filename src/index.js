#!/usr/bin/env node


const cmd = process.argv[2];

if (cmd === 'postpublish') {
  postpublish();
} else if (cmd === 'postversion') {
  postversion();
}
