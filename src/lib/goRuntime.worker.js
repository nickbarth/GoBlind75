let ready;

async function startRuntime(runtimeBase) {
  if (ready) return ready;
  ready = (async () => {
    // Vite emits inline workers as module workers, where importScripts is not
    // available. Go's runtime script is still safe to load as a module: it
    // installs the Go constructor on globalThis and exports nothing.
    await import(/* @vite-ignore */ `${runtimeBase}go/wasm_exec.js`);
    const go = new Go();
    const response = await fetch(`${runtimeBase}go/runner.wasm`);
    if (!response.ok) throw new Error(`Could not load Go runtime (${response.status}).`);
    let instance;
    try {
      ({ instance } = await WebAssembly.instantiateStreaming(response.clone(), go.importObject));
    } catch {
      ({ instance } = await WebAssembly.instantiate(await response.arrayBuffer(), go.importObject));
    }
    void go.run(instance);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Go runtime did not initialise.')), 10_000);
      const check = () => {
        if (typeof self.runGoProgram === 'function') { clearTimeout(timeout); resolve(); return; }
        setTimeout(check, 10);
      };
      check();
    });
  })();
  return ready;
}

self.onmessage = async ({ data }) => {
  try {
    await startRuntime(data.runtimeBase);
    const results = data.sources.map((source) => self.runGoProgram(source));
    self.postMessage({ ok: true, results });
  } catch (error) {
    self.postMessage({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};
