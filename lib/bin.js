#!/usr/bin/env node

import { pull, push, version, add, setup } from './index.js';

const [, , cmd, ...args] = process.argv;
const commands = {
  pull,
  push,
  add,
  setup,
  ['-v']: version,
};
(async () => {
  try {
    if (!commands[cmd]) throw new Error(`command: ${cmd} not found.\ncommands: ${Object.keys(commands).join(', ')}`);
    commands[cmd](...args);
  }
  catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
