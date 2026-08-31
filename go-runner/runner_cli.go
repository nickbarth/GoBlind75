//go:build !js

package main

import (
	"encoding/base64"
	"encoding/json"
	"os"
)

// This tiny local-only executable exists for fixture verification. The browser
// uses main.go; both paths call the exact same Yaegi evaluate function.
func main() {
	if len(os.Args) != 2 { panic("expected a base64 Go source argument") }
	source, err := base64.StdEncoding.DecodeString(os.Args[1])
	if err != nil { panic(err) }
	if err := json.NewEncoder(os.Stdout).Encode(evaluate(string(source))); err != nil { panic(err) }
}
