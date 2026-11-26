// Safe localStorage access: private windows or blocked storage must not break the page
const PREFIX = 'alcachofas:';

export function readValue(key) {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writeValue(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, value);
  } catch {
    // Storage unavailable: values simply are not remembered
  }
}
