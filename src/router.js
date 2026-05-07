let render = () => {};

export function setNavigateHandler(fn) {
  render = fn;
}

export function navigate(path, opts = {}) {
  if (opts.replace) {
    window.history.replaceState({}, '', path);
  } else {
    window.history.pushState({}, '', path);
  }
  render();
}
