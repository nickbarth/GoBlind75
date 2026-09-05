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
import ("fmt"; "reflect"; "sort"; "strings"; "container/heap")
type maxHeap []int
func (h maxHeap) Len() int { return len(h) }
func (h maxHeap) Less(i, j int) bool { return h[i] > h[j] }
func (h maxHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
func (h *maxHeap) Push(value interface{}) { *h = append(*h, value.(int)) }
func (h *maxHeap) Pop() interface{} { old := *h; value := old[len(old)-1]; *h = old[:len(old)-1]; return value }
func mapsEqual(left, right any) bool { return reflect.DeepEqual(left, right) }
type blind75Ordered interface { ~int | ~int8 | ~int16 | ~int32 | ~int64 | ~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr | ~float32 | ~float64 | ~string }
func blind75SlicesSort[T blind75Ordered](values []T) { sort.Slice(values, func(i, j int) bool { return values[i] < values[j] }) }
func blind75SlicesSortFunc[T any](values []T, compare func(T, T) int) { sort.Slice(values, func(i, j int) bool { return compare(values[i], values[j]) < 0 }) }
func blind75SlicesReverse[T any](values []T) { for i, j := 0, len(values)-1; i < j; i, j = i+1, j-1 { values[i], values[j] = values[j], values[i] } }
func blind75CmpCompare[T blind75Ordered](left, right T) int { if left < right { return -1 }; if left > right { return 1 }; return 0 }
func blind75CmpOr[T any](first, second T) T { var zero T; if !reflect.DeepEqual(first, zero) { return first }; return second }
type Person struct { name string; age int }
func main() { values := []int{3, 1, 2}; blind75SlicesReverse(values); blind75SlicesSort(values); h := &maxHeap{}; heap.Push(h, 2); heap.Push(h, 4); var b strings.Builder; b.WriteString("ok"); people := []Person{{name: "Jax", age: 37}, {name: "TJ", age: 25}, {name: "Alex", age: 72}}; blind75SlicesSortFunc(people, func(a, b Person) int { return blind75CmpOr(blind75CmpCompare(a.age, b.age), blind75CmpCompare(a.name, b.name)) }); fmt.Printf("%v:%s:%t:%v", heap.Pop(h), b.String(), mapsEqual(map[int]string{1: "one"}, map[int]string{1: "one"}), people) }
`)
	if err != nil { t.Fatal(err) }
	if got, want := output.String(), "4:ok:true:[{TJ 25} {Jax 37} {Alex 72}]"; got != want { t.Fatalf("output = %q, want %q", got, want) }
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

func TestEvaluateRecoversInterpreterPanics(t *testing.T) {
	result := evaluate(`package main
func main() { values := make([]int, 1); _ = values[1] }
`)
	if result.Error == "" { t.Fatal("expected an interpreter panic to be returned as an error") }
}
