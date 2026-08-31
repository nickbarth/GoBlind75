package main

import (
	"bytes"
	"testing"

	"github.com/traefik/yaegi/interp"
)

func TestBlind75SymbolsExecuteReferenceStyleCode(t *testing.T) {
	for pkg, values := range blind75Symbols() {
		for name, value := range values { if !value.IsValid() { t.Fatalf("invalid symbol %s.%s", pkg, name) } }
	}
	var output bytes.Buffer
	i := interp.New(interp.Options{Stdout: &output})
	if err := i.Use(blind75Symbols()); err != nil { t.Fatal(err) }
	_, err := i.Eval(`package main
import ("fmt"; "sort"; "strings"; "container/heap")
type maxHeap []int
func (h maxHeap) Len() int { return len(h) }
func (h maxHeap) Less(i, j int) bool { return h[i] > h[j] }
func (h maxHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
func (h *maxHeap) Push(value interface{}) { *h = append(*h, value.(int)) }
func (h *maxHeap) Pop() interface{} { old := *h; value := old[len(old)-1]; *h = old[:len(old)-1]; return value }
func main() { values := []int{3, 1, 2}; sort.Ints(values); h := &maxHeap{}; heap.Push(h, 2); heap.Push(h, 4); var b strings.Builder; b.WriteString("ok"); fmt.Printf("%v:%s", heap.Pop(h), b.String()) }
`)
	if err != nil { t.Fatal(err) }
	if got, want := output.String(), "4:ok"; got != want { t.Fatalf("output = %q, want %q", got, want) }
}

func TestEvaluateGeneratedProgramShape(t *testing.T) {
	result := evaluate(`package main
import "fmt"
func emitResult(value any) { fmt.Printf("__BLIND75_RESULT__%v\n", value) }
func hasDuplicate(nums []int) bool { seen := map[int]bool{}; for _, value := range nums { if seen[value] { return true }; seen[value] = true }; return false }
func main() { emitResult(hasDuplicate([]int{1, 2, 3, 3})) }
`)
	if result.Error != "" { t.Fatal(result.Error) }
	if got, want := result.Stdout, "__BLIND75_RESULT__true\n"; got != want { t.Fatalf("stdout = %q, want %q", got, want) }
}
