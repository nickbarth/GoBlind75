let ready;

async function startRuntime(runtimeBase) {
  if (ready) return ready;
  ready = (async () => {
    // This worker is emitted as a classic IIFE worker (see vite.config.js),
    // which lets the Go runtime install its global Go constructor directly.
    // Inline workers run from a blob: URL, so resolve Pages' root-relative
    // asset paths against the actual page origin before loading them.
    const wasmExecUrl = new URL(`${runtimeBase}go/wasm_exec.js`, self.location.origin).href;
    const runnerUrl = new URL(`${runtimeBase}go/runner.wasm`, self.location.origin).href;
    importScripts(wasmExecUrl);
    const go = new Go();
    const response = await fetch(runnerUrl);
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
