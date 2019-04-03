'use strict';
const doc = document;
const a = {};
const expose = +new Date();
const rExtractUri = /((?:http|https|file):\/\/.*?\/[^:]+)(?::\d+)?:\d+/;
const isLtIE8 = ('' + doc.querySelector).indexOf('[native code]') === -1;

export default function getCurrAbsPath() {
  // FF,Chrome
  if (doc.currentScript) {
    return doc.currentScript.src;
  }

  let stack;
  try {
    a.b();
  } catch (e) {
    stack = e.fileName || e.sourceURL || e.stack || e.stacktrace;
  }
  // IE10
  if (stack) {
    const absPath = rExtractUri.exec(stack)[1];
    if (absPath) {
      return absPath;
    }
  }

  // IE5-9
  for (let scripts = doc.scripts,
    i = scripts.length - 1,
    script; script = scripts[i--];) {
    if (script.className !== expose && script.readyState === 'interactive') {
      script.className = expose;
      // if less than ie 8, must get abs path by getAttribute(src, 4)
      return isLtIE8 ? script.getAttribute('src', 4) : script.src;
    }
  }
};
