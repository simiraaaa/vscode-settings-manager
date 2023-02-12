// .vscode/settings.json を読み込む
// .vscode-manager

import path from 'path';
import fs from 'fs';
import { CONFIG_PATH, SETTINGS_PATH, VSCODE_SETTINGS_PATH } from "./constants.js";

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

const loadVscodeSettings = () => {
  if (fs.existsSync(VSCODE_SETTINGS_PATH)) {
    return loadJSON(VSCODE_SETTINGS_PATH);
  } else {
    return {};
  }
};

const loadSettings = () => {
  if (fs.existsSync(SETTINGS_PATH)) {
    return loadJSON(SETTINGS_PATH);
  } else {
    return {};
  }
};

export const push = () => {
  const config = loadConfig();
  const vscode_settings = loadVscodeSettings();
  const settings = loadSettings();
  config.targets?.forEach((target) => {
    if (target in vscode_settings) {
      settings[target] = vscode_settings[target];
    }
  });
  writeJSON(SETTINGS_PATH, settings);
  console.log(`DONE: ${VSCODE_SETTINGS_PATH} → ${SETTINGS_PATH}`);
};

export const pull = () => {
  const config = loadConfig();
  const vscode_settings = loadVscodeSettings();
  const settings = loadSettings();
  config.targets?.forEach((target) => {
    if (target in settings) {
      vscode_settings[target] = settings[target];
    }
  });
  writeJSON(VSCODE_SETTINGS_PATH, settings);
  console.log(`DONE: ${SETTINGS_PATH} → ${VSCODE_SETTINGS_PATH}`);
};

export const version = () => {
  console.log(loadJSON(path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'package.json')).version);
};

// add target
export const add = (targets = '') => {
  const config = loadConfig();
  targets.split(',').forEach(target => {
    target = target.trim();
    if (!target || config.targets.includes(target)) return;
    config.targets.push(target);
  });
  writeJSON(CONFIG_PATH, config);
  console.log(`add targets: ${targets}`);
};

export const setup = () => {
  
};
