// .vscode/settings.json を読み込む
// .vscode-manager

import path from 'path';
import fs from 'fs';
import { CONFIG_PATH, SETTINGS_PATH, VSCODE_SETTINGS_PATH } from "./constants.js";
import { execSync } from 'child_process';

/**
 * file を JSON 形式で読み込み
 * @param {string} file 
 */
const loadJSON = (file) => {
  return JSON.parse(fs.readFileSync(file).toString());
};

/**
 * JSON を書き込む
 * @param {string} file 
 * @param {any} json 
 */
const writeJSON = (file, json) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(json, null, '  '));
};

// config を読み込む
const loadConfig = () => {
  if (fs.existsSync(CONFIG_PATH)) {
    return loadJSON(CONFIG_PATH);
  } else {
    return { targets: [] };
  }
};

/**
 * vscode かコミット用の設定を読み込みます
 * @param {VSCODE_SETTINGS_PATH | SETTINGS_PATH} file_path 
 * @returns 
 */
const loadSettings = (file_path) => {
  if (fs.existsSync(file_path)) {
    return loadJSON(file_path);
  } else {
    return {};
  }
};

/**
 * 
 * @param {VSCODE_SETTINGS_PATH | SETTINGS_PATH} from 
 * @param {VSCODE_SETTINGS_PATH | SETTINGS_PATH} to 
 */
const merge = (from, to) => {
  const config = loadConfig();
  const from_settings = loadSettings(from);
  const to_settings = loadSettings(to);
  config.targets?.forEach((target) => {
    // すべて
    if (target === '*') {
      for (let id in from_settings) {
        to_settings[id] = from_settings[id];
      }
      return;
    }

    // xxx.*:  xxx. に前方一致するものをすべて含める
    const [matched, id_prefix] = target.match(/(^[^.]+\.)\*$/) || [];
    if (matched) {
      for (let id in from_settings) {
        if (id.indexOf(id_prefix) === 0) {
          to_settings[id] = from_settings[id];
        }
      }
      return;
    }

    // target に完全一致するものを含める
    if (target in from_settings) {
      to_settings[target] = from_settings[target];
    }
  });
  writeJSON(to, to_settings);
  console.log(`DONE: ${from} → ${to}`);
};

export const push = () => {
  merge(VSCODE_SETTINGS_PATH, SETTINGS_PATH);
};

export const pull = () => {
  merge(SETTINGS_PATH, VSCODE_SETTINGS_PATH);
};

const loadPackageJSON = () => {
  return loadJSON(path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'package.json'));
};

export const version = () => {
  console.log(loadPackageJSON().version);
};

// add target
export const add = (targets = '') => {
  const config = loadConfig();
  const target_set = new Set(config.targets);
  targets.split(',').forEach(target => {
    target_set.add(target.trim());
  });
  config.targets = [...target_set].filter(Boolean);
  writeJSON(CONFIG_PATH, config);
  console.log(`add targets: ${targets}`);
};

// remove target
export const remove = (targets = '') => {
  const config = loadConfig();
  const target_set = new Set(config.targets);
  targets.split(',').forEach(target => {
    target_set.delete(target.trim());
  });
  config.targets = [...target_set].filter(Boolean);
  writeJSON(CONFIG_PATH, config);
  console.log(`remove targets: ${targets}`);
};

export const setup = () => {
  const config = loadConfig();
  const setup_progress = config.setupProgress || -1;
  const COMMAND = loadPackageJSON().name;

  const HUSKY_BIN = path.join('$(npm bin)', 'husky');
  const COMMAND_BIN = path.join('\\$(npm bin)', COMMAND);
  const PRE_COMMIT = path.join('.husky', 'pre-commit');
  const POST_MERGE = path.join('.husky', 'post-merge');
  const POST_CHECKOUT = path.join('.husky', 'post-checkout');

  try {
    [
      `${HUSKY_BIN} install`,
      `${HUSKY_BIN} add ${PRE_COMMIT} "if [ -e \\"${COMMAND_BIN}\\" ]; then \\"${COMMAND_BIN}\\" push && git add ${SETTINGS_PATH}; fi"`,
      `git add ${PRE_COMMIT}`,
      `${HUSKY_BIN} add ${POST_MERGE} "if [ -e \\"${COMMAND_BIN}\\" ]; then \\"${COMMAND_BIN}\\" pull; fi"`,
      `git add ${POST_MERGE}`,
      `${HUSKY_BIN} add ${POST_CHECKOUT} "if [ -e \\"${COMMAND_BIN}\\" ]; then \\"${COMMAND_BIN}\\" pull; fi"`,
      `git add ${POST_CHECKOUT}`,
      `npm pkg set scripts.vsm:add="${COMMAND} add \\$1"`,
      `npm pkg set scripts.vsm:remove="${COMMAND} remove \\$1"`,
      `npm pkg set scripts.prepare="husky install && ${COMMAND} pull"`,
    ].forEach((command, i) => {
      if (setup_progress >= i) return;
      execSync(command);
      config.setupProgress = i;
    });
  } catch (e) {
    writeJSON(CONFIG_PATH, config);
    throw e;
  }
  console.log('setup: complete');
};
