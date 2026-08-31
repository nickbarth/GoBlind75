const RESULT = '__BLIND75_RESULT__';
const ERROR = '__BLIND75_ERROR__';

const LEGACY_PRELUDE = `package main

import (
  "container/heap"
  "encoding/json"
  "fmt"
  "math"
  "sort"
  "strconv"
  "strings"
)

var (
  _ = heap.Init
  _ = math.Inf
  _ = sort.Ints
  _ = strconv.Itoa
  _ = strings.Contains
)

type ListNode struct { Val int; Next *ListNode }
type TreeNode struct { Val int; Left *TreeNode; Right *TreeNode }
type Node struct { Val int; Neighbors []*Node }
type Interval struct { start int; end int }

func listFrom(values []int) *ListNode {
  if len(values) == 0 { return nil }
  dummy := &ListNode{}
  current := dummy
  for _, value := range values { current.Next = &ListNode{Val: value}; current = current.Next }
  return dummy.Next
}

func cycleListFrom(values []int, index int) *ListNode {
  head := listFrom(values)
  if head == nil || index < 0 { return head }
  var target, tail *ListNode
  for node, i := head, 0; node != nil; node, i = node.Next, i + 1 { if i == index { target = node }; tail = node }
  if target != nil { tail.Next = target }
  return head
}

func treeFrom(values []any) *TreeNode {
  if len(values) == 0 || values[0] == nil { return nil }
  nodes := make([]*TreeNode, len(values))
  for i, value := range values { if value != nil { nodes[i] = &TreeNode{Val: value.(int)} } }
  for i, node := range nodes { if node == nil { continue }; left, right := i*2+1, i*2+2; if left < len(nodes) { node.Left = nodes[left] }; if right < len(nodes) { node.Right = nodes[right] } }
  return nodes[0]
}

func treeNode(root *TreeNode, value int) *TreeNode { if root == nil { return nil }; if root.Val == value { return root }; if node := treeNode(root.Left, value); node != nil { return node }; return treeNode(root.Right, value) }

func graphFrom(adjacency [][]int) *Node {
  if len(adjacency) == 0 { return nil }
  nodes := make([]*Node, len(adjacency)); for i := range nodes { nodes[i] = &Node{Val: i + 1} }
  for i, values := range adjacency { for _, value := range values { nodes[i].Neighbors = append(nodes[i].Neighbors, nodes[value-1]) } }
  return nodes[0]
}

func listValue(head *ListNode) []int { output := []int{}; seen := map[*ListNode]bool{}; for head != nil && !seen[head] { seen[head] = true; output = append(output, head.Val); head = head.Next }; return output }
func treeValue(root *TreeNode) []any { if root == nil { return []any{} }; output := []any{}; queue := []*TreeNode{root}; for len(queue) > 0 { node := queue[0]; queue = queue[1:]; if node == nil { output = append(output, nil); continue }; output = append(output, node.Val); queue = append(queue, node.Left, node.Right) }; for len(output) > 0 && output[len(output)-1] == nil { output = output[:len(output)-1] }; return output }
func graphValue(root *Node) [][]int { if root == nil { return [][]int{} }; queue := []*Node{root}; seen := map[*Node]int{root: 1}; output := [][]int{}; for len(queue) > 0 { node := queue[0]; queue = queue[1:]; index := seen[node]-1; for len(output) <= index { output = append(output, nil) }; for _, neighbor := range node.Neighbors { if _, ok := seen[neighbor]; !ok { seen[neighbor] = len(seen)+1; queue = append(queue, neighbor) }; output[index] = append(output[index], seen[neighbor]) } }; return output }
func emitResult(value any) { encoded, err := json.Marshal(value); if err != nil { fmt.Printf("${ERROR}%s\\n", err); return }; fmt.Printf("${RESULT}%s\\n", encoded) }
`;

function preludeFor(problem, code) {
  const imports = ['"fmt"'];
  const packageFor = { heap: '"container/heap"', math: '"math"', sort: '"sort"', strconv: '"strconv"', strings: '"strings"' };
  for (const [name, source] of Object.entries(packageFor)) if (new RegExp(`\\b${name}\\.`).test(code)) imports.push(source);
  const helpers = [];
  if (/ListNode/.test(problem.starterCode)) helpers.push(`type ListNode struct { Val int; Next *ListNode }
func listFrom(values []int) *ListNode { if len(values) == 0 { return nil }; dummy := &ListNode{}; current := dummy; for _, value := range values { current.Next = &ListNode{Val: value}; current = current.Next }; return dummy.Next }
func cycleListFrom(values []int, index int) *ListNode { head := listFrom(values); if head == nil || index < 0 { return head }; var target, tail *ListNode; for node, i := head, 0; node != nil; node, i = node.Next, i+1 { if i == index { target = node }; tail = node }; if target != nil { tail.Next = target }; return head }
func listValue(head *ListNode) []int { output := []int{}; seen := map[*ListNode]bool{}; for head != nil && !seen[head] { seen[head] = true; output = append(output, head.Val); head = head.Next }; return output }`);
  if (/TreeNode/.test(problem.starterCode)) helpers.push(`type TreeNode struct { Val int; Left *TreeNode; Right *TreeNode }
func treeFrom(values []any) *TreeNode { if len(values) == 0 || values[0] == nil { return nil }; nodes := make([]*TreeNode, len(values)); for i, value := range values { if value != nil { nodes[i] = &TreeNode{Val: value.(int)} } }; for i, node := range nodes { if node == nil { continue }; left, right := i*2+1, i*2+2; if left < len(nodes) { node.Left = nodes[left] }; if right < len(nodes) { node.Right = nodes[right] } }; return nodes[0] }
func treeNode(root *TreeNode, value int) *TreeNode { if root == nil { return nil }; if root.Val == value { return root }; if node := treeNode(root.Left, value); node != nil { return node }; return treeNode(root.Right, value) }
func treeValue(root *TreeNode) []any { if root == nil { return []any{} }; output := []any{}; queue := []*TreeNode{root}; for len(queue) > 0 { node := queue[0]; queue = queue[1:]; if node == nil { output = append(output, nil); continue }; output = append(output, node.Val); queue = append(queue, node.Left, node.Right) }; for len(output) > 0 && output[len(output)-1] == nil { output = output[:len(output)-1] }; return output }`);
  if (/\bNode\b/.test(problem.starterCode)) helpers.push(`type Node struct { Val int; Neighbors []*Node }
func graphFrom(adjacency [][]int) *Node { if len(adjacency) == 0 { return nil }; nodes := make([]*Node, len(adjacency)); for i := range nodes { nodes[i] = &Node{Val: i+1} }; for i, values := range adjacency { for _, value := range values { nodes[i].Neighbors = append(nodes[i].Neighbors, nodes[value-1]) } }; return nodes[0] }
func graphValue(root *Node) [][]int { if root == nil { return [][]int{} }; queue := []*Node{root}; seen := map[*Node]int{root: 1}; output := [][]int{}; for len(queue) > 0 { node := queue[0]; queue = queue[1:]; index := seen[node]-1; for len(output) <= index { output = append(output, nil) }; for _, neighbor := range node.Neighbors { if _, ok := seen[neighbor]; !ok { seen[neighbor] = len(seen)+1; queue = append(queue, neighbor) }; output[index] = append(output[index], seen[neighbor]) } }; return output }`);
  if (/Interval/.test(problem.starterCode)) helpers.push('type Interval struct { start int; end int }');
  const minShim = /func\s+min\s*\(/.test(code) ? '' : 'func min(values ...int) int { result := values[0]; for _, value := range values[1:] { if value < result { result = value } }; return result }';
  const maxShim = /func\s+max\s*\(/.test(code) ? '' : 'func max(values ...int) int { result := values[0]; for _, value := range values[1:] { if value > result { result = value } }; return result }';
  return `package main\n\nimport (\n  ${imports.join('\n  ')}\n)\n\n${minShim}\n${maxShim}\n\n${helpers.join('\n\n')}\n\nfunc emitResult(value any) { fmt.Printf("${RESULT}%v\\n", value) }\n`;
}

function parseValue(source) {
  const value = source.trim();
  if (/^[01]{8,}$/.test(value)) return Number.parseInt(value, 2);
  return JSON.parse(value.replace(/\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/g, '[$1,$2]'));
}

export function parseCase(raw) {
  const lines = raw.trim().split(/\r?\n/).filter(Boolean);
  if (lines.every((line) => line.trim().startsWith('[')) && lines.length === 2) return { operationArrays: lines.map(parseValue) };
  if (lines.length === 1 && lines[0].trim().startsWith('[')) return { flattenedOperations: parseValue(lines[0]) };
  const values = {};
  for (const line of lines) { const equal = line.indexOf('='); if (equal < 1) throw new Error(`Unsupported test input: ${line}`); values[line.slice(0, equal).trim()] = parseValue(line.slice(equal + 1)); }
  return { values };
}

function string(value) { return JSON.stringify(String(value)); }
function literal(value, type) {
  if (type === 'string') return string(value);
  if (type === 'byte') return String(String(value).charCodeAt(0));
  if (type === 'bool') return value ? 'true' : 'false';
  if (type === 'int' || type === 'float64' || type === 'float32') return String(value);
  if (type === '*ListNode') return `listFrom(${literal(value, '[]int')})`;
  if (type === '*TreeNode') return `treeFrom(${literal(value, '[]any')})`;
  if (type === '*Node') return `graphFrom(${literal(value, '[][]int')})`;
  if (type === 'Interval') return `Interval{start: ${value[0]}, end: ${value[1]}}`;
  if (type.startsWith('[]')) return `${type}{${(value ?? []).map((item) => literal(item, type.slice(2))).join(', ')}}`;
  if (type === 'any') return value === null ? 'nil' : Array.isArray(value) ? `[]any{${value.map((item) => literal(item, 'any')).join(', ')}}` : Number.isInteger(value) ? String(value) : string(value);
  return String(value);
}

function functionSignature(code) {
  const match = code.match(/func\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*([^\s{]+)?\s*\{/);
  if (!match) throw new Error('Could not find the starter function.');
  const params = match[2].split(',').map((item) => item.trim()).filter(Boolean).map((item) => {
    const [name, ...type] = item.split(/\s+/); return { name, type: type.join(' ') };
  });
  return { name: match[1], params, returns: match[3] ?? '' };
}

function emit(expression, type) {
  if (type === '*ListNode') return `emitResult(listValue(${expression}))`;
  if (type === '*TreeNode') return `emitResult(treeValue(${expression}))`;
  if (type === '*Node') return `emitResult(graphValue(${expression}))`;
  return `emitResult(${expression})`;
}

function normalInvocation(problem, parsed) {
  if (problem.id === 'string-encode-and-decode') {
    return `  strs := ${literal(parsed.values.strs, '[]string')}\n  solver := Solution{}\n  ${emit('solver.Decode(solver.Encode(strs))', '[]string')}`;
  }
  if (problem.id === 'serialize-and-deserialize-binary-tree') {
    return `  root := ${literal(parsed.values.root, '*TreeNode')}\n  codec := Constructor()\n  ${emit('codec.deserialize(codec.serialize(root))', '*TreeNode')}`;
  }
  const signature = functionSignature(problem.starterCode);
  const lines = [];
  for (const { name, type } of signature.params) {
    let value = parsed.values[name];
    if (problem.id === 'lowest-common-ancestor-in-binary-search-tree' && (name === 'p' || name === 'q')) { lines.push(`  ${name} := treeNode(root, ${value})`); continue; }
    if (problem.id === 'linked-list-cycle-detection' && name === 'head') { lines.push(`  head := cycleListFrom(${literal(value, '[]int')}, ${parsed.values.index ?? -1})`); continue; }
    lines.push(`  ${name} := ${literal(value, type)}`);
  }
  const args = signature.params.map(({ name }) => name).join(', ');
  if (!signature.returns) return `${lines.join('\n')}\n  ${signature.name}(${args})\n  ${emit(signature.params[0]?.name ?? 'nil', signature.params[0]?.type)}`;
  return `${lines.join('\n')}\n  ${emit(`${signature.name}(${args})`, signature.returns)}`;
}

function operationInvocation(problem, parsed) {
  const [operations, argsList] = parsed.operationArrays ?? [parsed.flattenedOperations, null];
  const type = problem.starterCode.match(/type\s+(\w+)\s+struct/)?.[1];
  if (!type) throw new Error('Could not find the design type.');
  const methods = [...problem.starterCode.matchAll(/func\s+\([^)]*\)\s*(\w+)\s*\([^)]*\)\s*([^\s{]+)?\s*\{/g)].map((match) => ({ name: match[1], returns: match[2] ?? '' }));
  const methodFor = (operation) => methods.find((method) => method.name.toLowerCase() === String(operation).toLowerCase());
  const values = [];
  const lines = [`  solver := Constructor()`, `  output := []any{nil}`];
  for (let index = 1; index < operations.length;) {
    const operation = operations[index];
    index += 1;
    const method = methodFor(operation);
    if (!method) throw new Error(`Unsupported ${type} operation: ${operation}`);
    const args = argsList ? argsList[index - 1] : (() => { const count = problem.starterCode.match(new RegExp(`func\\s+\\([^)]*\\)\\s*${method.name}\\s*\\(([^)]*)\\)`))?.[1].split(',').filter(Boolean).length ?? 0; const next = operations.slice(index, index + count); index += count; return next; })();
    const rendered = (args ?? []).map((value) => typeof value === 'number' || /^-?\d+(\.\d+)?$/.test(value) ? String(value) : string(value)).join(', ');
    if (method.returns) lines.push(`  output = append(output, solver.${method.name}(${rendered}))`); else lines.push(`  solver.${method.name}(${rendered}); output = append(output, nil)`);
  }
  return `${lines.join('\n')}\n  emitResult(output)`;
}

export function buildProgram(problem, code, raw) {
  if (/^\s*(package|import)\b/m.test(code)) throw new Error('Write only the function(s) from the starter code. Package and imports are supplied for you.');
  const parsed = parseCase(raw);
  const body = parsed.operationArrays || parsed.flattenedOperations ? operationInvocation(problem, parsed) : normalInvocation(problem, parsed);
  return `${preludeFor(problem, code)}\n${code}\n\nfunc main() {\n  defer func() { if value := recover(); value != nil { fmt.Printf("${ERROR}%v\\n", value) } }()\n${body}\n}\n`;
}

export function readProgramOutput(output = '') {
  const stdout = [];
  let result; let error;
  for (const line of output.split(/\r?\n/)) {
    if (line.startsWith(RESULT)) result = line.slice(RESULT.length);
    else if (line.startsWith(ERROR)) error = line.slice(ERROR.length).trim();
    else if (line) stdout.push(line);
  }
  return { result, error, stdout };
}
