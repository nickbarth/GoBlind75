const diagramByProblemId = {
  'max-water-container': 'container',
  'merge-two-sorted-linked-lists': 'linked-list',
  'linked-list-cycle-detection': 'cycle',
  'invert-a-binary-tree': 'tree',
  'depth-of-binary-tree': 'tree',
  'same-binary-tree': 'tree-compare',
  'subtree-of-a-binary-tree': 'tree',
  'lowest-common-ancestor-in-binary-search-tree': 'tree',
  'level-order-traversal-of-binary-tree': 'tree-levels',
  'valid-binary-search-tree': 'tree',
  'kth-smallest-integer-in-bst': 'tree',
  'binary-tree-from-preorder-and-inorder-traversal': 'tree',
  'binary-tree-maximum-path-sum': 'tree-path',
  'serialize-and-deserialize-binary-tree': 'tree',
  'search-for-word': 'word-grid',
  'search-for-word-ii': 'word-grid',
  'clone-graph': 'graph',
  'pacific-atlantic-water-flow': 'water-grid',
  'valid-tree': 'graph',
  'count-connected-components': 'graph',
  'count-paths': 'paths',
  'rotate-matrix': 'rotate',
  'spiral-matrix': 'spiral',
  'set-zeroes-in-matrix': 'zeroes',
};

const titles = {
  container: 'Container area diagram',
  'linked-list': 'Linked list diagram',
  cycle: 'Linked list cycle diagram',
  tree: 'Binary tree diagram',
  'tree-compare': 'Two binary trees diagram',
  'tree-levels': 'Binary tree levels diagram',
  'tree-path': 'Maximum path in a binary tree',
  'word-grid': 'Word search grid',
  graph: 'Graph diagram',
  'water-grid': 'Water flow grid',
  paths: 'Grid paths diagram',
  rotate: 'Matrix rotation diagram',
  spiral: 'Spiral matrix diagram',
  zeroes: 'Matrix zeroes diagram',
};

function Node({ x, y, value, accent = false, small = false }) {
  return <g><circle cx={x} cy={y} r={small ? 11 : 14} className={accent ? 'diagram-node accent' : 'diagram-node'} /><text x={x} y={y + (small ? 3.5 : 4)} textAnchor="middle" className={small ? 'diagram-small-label' : ''}>{value}</text></g>;
}

function Tree({ mode, problemId }) {
  const layouts = {
    'invert-a-binary-tree': { paths: 'M110 45 65 95M110 45 155 95M65 95 42 142M65 95 88 142M155 95 132 142M155 95 178 142', nodes: [[110, 35, '1'], [65, 85, '2'], [155, 85, '3'], [42, 132, '4'], [88, 132, '5'], [132, 132, '6'], [178, 132, '7']] },
    'depth-of-binary-tree': { paths: 'M110 45 65 95M110 45 155 95M155 95 132 142', nodes: [[110, 35, '1'], [65, 85, '2'], [155, 85, '3'], [132, 132, '4', true]] },
    'subtree-of-a-binary-tree': { paths: 'M110 45 65 95M110 45 155 95M65 95 42 142M65 95 88 142', nodes: [[110, 35, '1'], [65, 85, '2', true], [155, 85, '3'], [42, 132, '4', true], [88, 132, '5', true]] },
    'lowest-common-ancestor-in-binary-search-tree': { paths: 'M110 45 65 95M110 45 155 95M65 95 42 142M65 95 88 142M155 95 132 142M155 95 178 142M42 142 42 180', nodes: [[110, 35, '5', true], [65, 85, '3'], [155, 85, '8'], [42, 132, '1'], [88, 132, '4'], [132, 132, '7'], [178, 132, '9'], [42, 180, '2']] },
    'level-order-traversal-of-binary-tree': { paths: 'M110 45 65 95M110 45 155 95M65 95 42 142M65 95 88 142M155 95 132 142M155 95 178 142', nodes: [[110, 35, '1'], [65, 85, '2'], [155, 85, '3'], [42, 132, '4'], [88, 132, '5'], [132, 132, '6'], [178, 132, '7']] },
    'valid-binary-search-tree': { paths: 'M110 45 65 95M110 45 155 95', nodes: [[110, 35, '2'], [65, 85, '1'], [155, 85, '3']] },
    'kth-smallest-integer-in-bst': { paths: 'M110 45 65 95M110 45 155 95', nodes: [[110, 35, '2'], [65, 85, '1', true], [155, 85, '3']] },
    'binary-tree-from-preorder-and-inorder-traversal': { paths: 'M110 45 65 95M110 45 155 95M155 95 178 142', nodes: [[110, 35, '1'], [65, 85, '2'], [155, 85, '3'], [178, 132, '4']] },
    'binary-tree-maximum-path-sum': { paths: 'M110 45 65 95M110 45 155 95', nodes: [[110, 35, '1', true], [65, 85, '2', true], [155, 85, '3', true]] },
    'serialize-and-deserialize-binary-tree': { paths: 'M110 45 65 95M110 45 155 95M155 95 132 142M155 95 178 142', nodes: [[110, 35, '1'], [65, 85, '2'], [155, 85, '3'], [132, 132, '4'], [178, 132, '5']] },
  };
  const fallback = { paths: 'M110 45 65 95M110 45 155 95M65 95 42 142M65 95 88 142M155 95 132 142M155 95 178 142', nodes: [[110, 35, '5', mode === 'tree-path'], [65, 85, '3', mode === 'tree-path'], [155, 85, '8', mode === 'tree-path'], [42, 132, '1'], [88, 132, '4'], [132, 132, '7'], [178, 132, '9']] };
  const layout = layouts[problemId] ?? fallback;
  const edges = <g className="diagram-line"><path d={layout.paths} /></g>;
  if (mode === 'tree-compare') { const compareEdges = <g className="diagram-line"><path d="M110 45 65 95M110 45 155 95" /></g>; return <g transform="translate(-35 0)">{compareEdges}<Node x={110} y={35} value="1" /><Node x={65} y={85} value="2" /><Node x={155} y={85} value="3" /><g transform="translate(210 0)">{compareEdges}<Node x={110} y={35} value="1" /><Node x={65} y={85} value="2" /><Node x={155} y={85} value="3" /></g></g>; }
  return <g>{edges}{layout.nodes.map(([x, y, value, accent]) => <Node key={`${x}-${y}`} x={x} y={y} value={value} accent={accent} />)}</g>;
}

function Diagram({ kind, problemId }) {
  if (kind === 'container') return <g><path className="diagram-water" d="M65 75h180v90H65z" /><g className="diagram-bar"><path d="M35 165V150M65 165V60M95 165V135M125 165V90M155 165V105M185 165V60M215 165V120M245 165V75" /></g><path className="diagram-line" d="M25 165h240" /><text x="155" y="120" textAnchor="middle">36</text></g>;
  if (kind === 'linked-list') return <g><path className="diagram-line" d="M64 48h31m27 0h31M64 94h31m27 0h31M51 158h18m22 0h18m22 0h18m22 0h18m22 0h18" /><path className="accent-line" d="M160 111v25" markerEnd="url(#accent-arrow)" /><Node x={50} y={48} value="1" /><Node x={108} y={48} value="2" /><Node x={166} y={48} value="4" /><Node x={50} y={94} value="1" /><Node x={108} y={94} value="3" /><Node x={166} y={94} value="5" /><g><Node x={40} y={158} value="1" small /><Node x={80} y={158} value="1" small /><Node x={120} y={158} value="2" small /><Node x={160} y={158} value="3" small /><Node x={200} y={158} value="4" small /><Node x={240} y={158} value="5" small /></g><text x="218" y="52">list1</text><text x="218" y="98">list2</text><text x="258" y="162">merged</text></g>;
  if (kind === 'cycle') return <g><path className="diagram-line" d="M68 100h45m28 0h45m28 0h45" markerEnd="url(#arrow)" /><Node x={55} y={100} value="1" /><Node x={128} y={100} value="2" /><Node x={201} y={100} value="3" /><Node x={274} y={100} value="4" /><path className="diagram-line accent-line" d="M274 115c0 52-146 52-146 0" markerEnd="url(#accent-arrow)" /></g>;
  if (kind.startsWith('tree')) return <Tree mode={kind} problemId={problemId} />;
  if (kind === 'word-grid') return problemId === 'search-for-word-ii' ? <g><path className="diagram-grid" d="M65 25h160v160H65zM105 25v160M145 25v160M185 25v160M65 65h160M65 105h160M65 145h160" /><g className="diagram-label"><text x="85" y="50">a</text><text x="125" y="50">b</text><text x="165" y="50">c</text><text x="205" y="50">d</text><text x="85" y="90">s</text><text x="125" y="90">a</text><text x="165" y="90">a</text><text x="205" y="90">t</text><text x="85" y="130">a</text><text x="125" y="130">c</text><text x="165" y="130">k</text><text x="205" y="130">e</text><text x="85" y="170">a</text><text x="125" y="170">c</text><text x="165" y="170">d</text><text x="205" y="170">n</text></g><path className="accent-line" d="M85 130h40" /></g> : <g><path className="diagram-grid" d="M65 45h160v120H65zM105 45v120M145 45v120M185 45v120M65 85h160M65 125h160" /><g className="diagram-label"><text x="85" y="70">A</text><text x="125" y="70">B</text><text x="165" y="70">C</text><text x="205" y="70">D</text><text x="85" y="110">S</text><text x="125" y="110">A</text><text x="165" y="110">A</text><text x="205" y="110">T</text><text x="85" y="150">A</text><text x="125" y="150">C</text><text x="165" y="150">A</text><text x="205" y="150">E</text></g><path className="accent-line" d="M165 65v40h40" /></g>;
  if (kind === 'graph') {
    if (problemId === 'clone-graph') return <g><path className="diagram-line" d="M80 105h75m28 0h75" /><Node x={65} y={105} value="1" /><Node x={170} y={105} value="2" /><Node x={275} y={105} value="3" /></g>;
    if (problemId === 'count-connected-components') return <g><path className="diagram-line" d="M55 80h50m28 0h50M215 135h50" /><Node x={40} y={80} value="0" /><Node x={120} y={80} value="1" /><Node x={200} y={80} value="2" /><Node x={200} y={135} value="3" /><Node x={280} y={135} value="4" /></g>;
    return <g><path className="diagram-line" d="M160 50 80 110M160 50v60M160 50l80 60M80 110v60" /><Node x={160} y={50} value="0" /><Node x={80} y={110} value="1" /><Node x={160} y={110} value="2" /><Node x={240} y={110} value="3" /><Node x={80} y={170} value="4" /></g>;
  }
  if (kind === 'water-grid') return <g><path className="diagram-grid" d="M35 45h250v120H35zM85 45v120M135 45v120M185 45v120M235 45v120M35 85h250M35 125h250" /><path className="diagram-water" d="M36 46h48v38H36zM236 126h48v38h-48z" /><path className="accent-line" d="M60 65 110 105 160 105 210 145" markerEnd="url(#accent-arrow)" /><text x="30" y="30">Pacific</text><text x="228" y="190">Atlantic</text></g>;
  if (kind === 'paths') return <g><path className="diagram-grid" d="M35 55h240v90H35zM75 55v90M115 55v90M155 55v90M195 55v90M235 55v90M35 85h240M35 115h240" /><path className="accent-line" d="M55 70h200v60" markerEnd="url(#accent-arrow)" /><path className="accent-line" d="M55 70v60h200" markerEnd="url(#accent-arrow)" /></g>;
  if (kind === 'rotate') return <g><path className="diagram-grid" d="M45 55h70v70H45zM80 55v70M45 90h70" /><text x="62" y="80">1</text><text x="97" y="80">2</text><text x="62" y="115">3</text><text x="97" y="115">4</text><path className="accent-line" d="M135 90c0-38 65-38 65 0" markerEnd="url(#accent-arrow)" /><path className="diagram-grid" d="M205 55h70v70h-70zM240 55v70M205 90h70" /><text x="222" y="80">3</text><text x="257" y="80">1</text><text x="222" y="115">4</text><text x="257" y="115">2</text></g>;
  if (kind === 'spiral') return <g><path className="diagram-grid" d="M90 50h100v100H90zM140 50v100M90 100h100" /><text x="115" y="82">1</text><text x="165" y="82">2</text><text x="115" y="132">3</text><text x="165" y="132">4</text><path className="accent-line" d="M108 68h64v64h-64v-30h45" markerEnd="url(#accent-arrow)" /></g>;
  return <g><path className="diagram-grid" d="M105 55h110v110H105zM160 55v110M105 110h110" /><path className="diagram-zero" d="M106 56h54v54h-54zM161 111h54v54h-54z" /><text x="132" y="88">0</text><text x="187" y="143">0</text></g>;
}

export function ProblemDiagram({ problemId }) {
  const kind = diagramByProblemId[problemId];
  if (!kind) return null;
  return <figure className="problem-diagram"><svg viewBox="0 0 320 210" role="img" aria-label={titles[kind]}><defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path className="diagram-arrowhead" d="M0 0 7 3.5 0 7z" /></marker><marker id="accent-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path className="diagram-accent-arrowhead" d="M0 0 7 3.5 0 7z" /></marker></defs><Diagram kind={kind} problemId={problemId} /></svg><figcaption>{titles[kind]}</figcaption></figure>;
}
