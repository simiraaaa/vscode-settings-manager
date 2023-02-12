#!/usr/bin/env node

import { pull, push, version } from './index.js';

const [, , cmd, ...args] = process.argv;
const commands = {
  pull,
  push,
  ['-v']: version,
};
(async () => {
  try {
    if (!commands[cmd]) throw new Error(`command: ${cmd} not found.\ncommands: ${Object.keys(commands).join(', ')}`);
    commands[cmd]();
  }
  catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
