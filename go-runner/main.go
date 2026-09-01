//go:build js && wasm

package main

import (
	"fmt"
	"go/format"
	"syscall/js"
)

// runGoProgram is deliberately tiny: JavaScript is responsible for creating
// the complete, problem-specific program while Yaegi evaluates it entirely in
// this WebAssembly module. A fresh interpreter prevents state from one run
// leaking into the next.
func runGoProgram(_ js.Value, args []js.Value) any {
	if len(args) != 1 || args[0].Type() != js.TypeString {
		return map[string]any{"error": "runner expected one Go source string"}
	}

	evaluation := evaluate(args[0].String())
	result := map[string]any{
		"stdout": evaluation.Stdout,
		"stderr": evaluation.Stderr,
	}
	if evaluation.Error != "" {
		result["error"] = evaluation.Error
	}
	return result
}

// formatGoProgram formats the editor's Go source with the standard gofmt
// implementation compiled into the browser runtime.
func formatGoProgram(_ js.Value, args []js.Value) any {
	if len(args) != 1 || args[0].Type() != js.TypeString {
		return map[string]any{"error": "formatter expected one Go source string"}
	}

	formatted, err := format.Source([]byte(args[0].String()))
	if err != nil {
		return map[string]any{"error": fmt.Sprint(err)}
	}
	return map[string]any{"source": string(formatted)}
}

func main() {
	js.Global().Set("runGoProgram", js.FuncOf(runGoProgram))
	js.Global().Set("formatGoProgram", js.FuncOf(formatGoProgram))
	select {}
}
