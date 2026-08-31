package main

import (
	"bytes"
	"fmt"

	"github.com/traefik/yaegi/interp"
)

type evaluation struct {
	Stdout string `json:"stdout"`
	Stderr string `json:"stderr"`
	Error  string `json:"error,omitempty"`
}

func evaluate(source string) evaluation {
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	i := interp.New(interp.Options{Stdout: &stdout, Stderr: &stderr})
	result := evaluation{}
	if err := i.Use(blind75Symbols()); err != nil { result.Error = fmt.Sprint(err); return result }
	_, err := i.Eval(source)
	result.Stdout, result.Stderr = stdout.String(), stderr.String()
	if err != nil { result.Error = fmt.Sprint(err) }
	return result
}
