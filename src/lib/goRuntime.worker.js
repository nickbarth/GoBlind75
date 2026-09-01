let ready;

async function loadWasmExec(url) {
  try {
    importScripts(url);
  } catch (error) {
    // Vite serves workers as modules in development. Module workers disallow
    // importScripts, but the same Go loader is valid as a dynamic ES module.
    if (!(error instanceof TypeError) || !error.message.includes('Module scripts')) throw error;
    await import(/* @vite-ignore */ url);
  }
}

async function startRuntime(runtimeBase) {
  if (ready) return ready;
  ready = (async () => {
    // Production emits a classic IIFE worker while Vite development serves a
    // module worker. Resolve root-relative asset paths against the page origin
    // so either form can load the Go runtime from a worker or blob URL.
    const wasmExecUrl = new URL(`${runtimeBase}go/wasm_exec.js`, self.location.origin).href;
    const runnerUrl = new URL(`${runtimeBase}go/runner.wasm`, self.location.origin).href;
    await loadWasmExec(wasmExecUrl);
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
    if (data.action === 'format') {
      self.postMessage({ ok: true, result: self.formatGoProgram(data.source) });
      return;
    }
    const results = data.sources.map((source) => self.runGoProgram(source));
    self.postMessage({ ok: true, results });
  } catch (error) {
    self.postMessage({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};
