package main

import (
	"container/heap"
	"encoding/json"
	"fmt"
	"math"
	"reflect"
	"sort"
	"strconv"
	"strings"

	"github.com/traefik/yaegi/interp"
)

type heapInterfaceWrapper struct {
	IValue interface{}
	WLen   func() int
	WLess  func(i, j int) bool
	WPop   func() any
	WPush  func(any)
	WSwap  func(i, j int)
}

func (w heapInterfaceWrapper) Len() int { return w.WLen() }
func (w heapInterfaceWrapper) Less(i, j int) bool { return w.WLess(i, j) }
func (w heapInterfaceWrapper) Pop() any { return w.WPop() }
func (w heapInterfaceWrapper) Push(value any) { w.WPush(value) }
func (w heapInterfaceWrapper) Swap(i, j int) { w.WSwap(i, j) }

// Importing yaegi/stdlib links wrappers for the whole Go standard library into
// the WASM binary. Blind 75 needs only this compact, documented subset.
func blind75Symbols() interp.Exports {
	return interp.Exports{
		"container/heap/heap": {
			"Init": reflect.ValueOf(heap.Init), "Push": reflect.ValueOf(heap.Push), "Pop": reflect.ValueOf(heap.Pop),
			"Interface": reflect.ValueOf((*heap.Interface)(nil)), "_Interface": reflect.ValueOf((*heapInterfaceWrapper)(nil)),
		},
		"encoding/json/json": {"Marshal": reflect.ValueOf(json.Marshal)},
		"fmt/fmt": {
			"Print": reflect.ValueOf(fmt.Print), "Printf": reflect.ValueOf(fmt.Printf), "Println": reflect.ValueOf(fmt.Println),
			"Sprint": reflect.ValueOf(fmt.Sprint), "Sprintf": reflect.ValueOf(fmt.Sprintf), "Errorf": reflect.ValueOf(fmt.Errorf),
		},
		"math/math": {
			"Inf": reflect.ValueOf(math.Inf), "MaxInt": reflect.ValueOf(math.MaxInt), "MinInt": reflect.ValueOf(math.MinInt),
			"MaxInt32": reflect.ValueOf(math.MaxInt32), "MinInt32": reflect.ValueOf(math.MinInt32),
		},
		"sort/sort": {"Ints": reflect.ValueOf(sort.Ints), "Slice": reflect.ValueOf(sort.Slice)},
		"strconv/strconv": {"Atoi": reflect.ValueOf(strconv.Atoi), "Itoa": reflect.ValueOf(strconv.Itoa)},
		"strings/strings": {
			"Builder": reflect.ValueOf((*strings.Builder)(nil)), "Contains": reflect.ValueOf(strings.Contains), "Join": reflect.ValueOf(strings.Join),
			"Split": reflect.ValueOf(strings.Split), "ToLower": reflect.ValueOf(strings.ToLower),
		},
	}
}
