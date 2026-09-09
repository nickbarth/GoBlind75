import { runnerWasmBase64, wasmExecSource } from '../generated/goRuntimeAssets.js';

let ready;

function base64ToArrayBuffer(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

async function loadWasmExec() {
  const url = URL.createObjectURL(new Blob([wasmExecSource], { type: 'text/javascript' }));
  try {
    importScripts(url);
  } catch (error) {
    // Vite serves workers as modules in development. Module workers disallow
    // importScripts, but the same Go loader is valid as a dynamic ES module.
    if (!(error instanceof TypeError) || !error.message.includes('Module scripts')) throw error;
    await import(/* @vite-ignore */ url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function startRuntime() {
  if (ready) return ready;
  ready = (async () => {
    // The loader and interpreter are compiled into this worker bundle, so a
    // run never needs to fetch Go runtime assets from the network.
    await loadWasmExec();
    const go = new Go();
    const { instance } = await WebAssembly.instantiate(base64ToArrayBuffer(runnerWasmBase64), go.importObject);
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
    await startRuntime();
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
