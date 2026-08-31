import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { go } from '@codemirror/lang-go';
import { oneDark } from '@codemirror/theme-one-dark';
import { drawSelection, EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from '@codemirror/view';
import Markdown from 'react-markdown';
import snapshot from './data/blind75-problems.json';
import { ProblemDiagram } from './ProblemDiagram.jsx';
import { clearState, loadState, saveState } from './lib/storage.js';
import { runProblem } from './lib/goProblemRunner.js';

const problems = snapshot.problems;

function formatValue(value) {
  if (value === undefined) return 'undefined';
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}

function Difficulty({ value }) {
  return <span className={`difficulty ${value.toLowerCase()}`}>{value}</span>;
}

function IconButton({ label, className = '', children, ...props }) {
  return <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>{children}</button>;
}

function MenuIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

function CodeEditor({ value, onChange, readOnly = false, onRun }) {
  const hostRef = useRef(null);
  const viewRef = useRef(null);
  const runRef = useRef(onRun);
  const changeRef = useRef(onChange);
  useEffect(() => { runRef.current = onRun; }, [onRun]);
  useEffect(() => { changeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!hostRef.current) return undefined;
    const runFromShortcut = () => { runRef.current?.(); return true; };
    const isRunShortcut = (event) => (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.code === 'Quote';
    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(), drawSelection(), highlightActiveLine(), highlightActiveLineGutter(), go(), oneDark,
        keymap.of([{ key: "Mod-'", run: runFromShortcut }, ...defaultKeymap, indentWithTab]),
        EditorView.domEventHandlers({ keydown: (event) => {
          if (!isRunShortcut(event)) return false;
          event.preventDefault();
          return runFromShortcut();
        } }),
        EditorView.theme({ '&': { height: '100%', fontSize: '14px' }, '.cm-scroller': { overflow: 'auto' }, '.cm-content': { padding: '12px 0' } }),
        EditorView.updateListener.of((update) => { if (update.docChanged) changeRef.current?.(update.state.doc.toString()); }),
        ...(readOnly ? [EditorState.readOnly.of(true), EditorView.editable.of(false)] : []),
      ],
    });
    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;
    return () => { view.destroy(); viewRef.current = null; };
  }, [readOnly]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || value === view.state.doc.toString()) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
  }, [value]);

  return <div className="code-editor" ref={hostRef} />;
}

function TestOutput({ results, running }) {
  const stdout = results?.flatMap((result, index) => result.logs?.length ? [`Test ${index + 1}`, ...result.logs] : []) ?? [];
  if (running) return <section className="output"><h2>Test results</h2><p>Running all three tests…</p><section className="stdout"><h2>stdout</h2><p className="muted">Waiting for console output…</p></section></section>;
  if (!results) return <section className="output muted"><h2>Test results</h2><p>No code has been run yet.</p><section className="stdout"><h2>stdout</h2><p>No console output yet.</p></section></section>;
  return <section className="output" aria-live="polite">
    <h2>Test results</h2>
    {results.map((result, index) => <article className={`test-result ${result.passed ? 'passed' : 'failed'}`} key={`${result.raw}-${index}`}>
      <header><strong>Test {index + 1}</strong><span>{result.passed ? 'Passed' : result.timedOut ? 'Timed out' : 'Failed'}</span></header>
      <pre><b>Input</b>{'\n'}{result.raw}</pre>
      {result.error ? <pre className="error"><b>Error</b>{'\n'}{result.error}</pre> : <>
        <pre><b>Expected</b>{'\n'}{formatValue(result.expected)}</pre>
        <pre><b>Actual</b>{'\n'}{formatValue(result.actual)}</pre>
      </>}
    </article>)}
    <section className="stdout"><h2>stdout</h2>{stdout.length ? <pre>{stdout.join('\n')}</pre> : <p className="muted">No console output.</p>}</section>
  </section>;
}

function Sidebar({ selectedId, completed, onSelect, onResetAll }) {
  const groups = useMemo(() => {
    const categories = new Map();
    for (const problem of problems) {
      if (!categories.has(problem.category)) categories.set(problem.category, []);
      categories.get(problem.category).push(problem);
    }
    return [...categories.entries()];
  }, []);
  return <aside className="sidebar">
    <div className="sidebar-title"><div className="sidebar-heading"><h1>Blind 75</h1></div><div className="sidebar-progress"><span>{completed.size}/75 complete</span><IconButton label="Reset all saved code and completion marks" onClick={onResetAll}>↻</IconButton></div></div>
    {groups.map(([category, categoryProblems]) => {
      const done = categoryProblems.filter((problem) => completed.has(problem.id)).length;
      return <section className="category" key={category}>
        <h2>{category}<small>{done}/{categoryProblems.length}</small></h2>
        {categoryProblems.map((problem) => <button className={`question-row ${selectedId === problem.id ? 'selected' : ''}`} key={problem.id} onClick={() => onSelect(problem.id)}>
          <span className="question-status" aria-label={completed.has(problem.id) ? 'Complete' : 'Incomplete'}>{completed.has(problem.id) ? '✓' : '○'}</span>
          <span className="question-name">{problem.title}</span>
          <Difficulty value={problem.difficulty} />
        </button>)}
      </section>;
    })}
  </aside>;
}

export default function App() {
  const [state, setState] = useState({ codeByProblemId: {}, completedProblemIds: [] });
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(problems[0].id);
  const [tab, setTab] = useState('problem');
  const [listVisible, setListVisible] = useState(true);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [success, setSuccess] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    let active = true;
    Promise.race([
      loadState(),
      new Promise((resolve) => window.setTimeout(() => resolve(null), 1500)),
    ]).then((saved) => {
      if (!active) return;
      if (saved) setState(saved);
      setLoaded(true);
    }).catch(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!loaded) return undefined;
    const timer = window.setTimeout(() => { saveState(state).catch(() => {}); }, 300);
    return () => window.clearTimeout(timer);
  }, [loaded, state]);

  const selected = problems.find((problem) => problem.id === selectedId) ?? problems[0];
  const completed = useMemo(() => new Set(state.completedProblemIds), [state.completedProblemIds]);
  const code = state.codeByProblemId[selected.id] ?? selected.starterCode;

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0 });
  }, [selected.id]);

  const updateCode = (nextCode) => setState((current) => ({
    ...current,
    codeByProblemId: { ...current.codeByProblemId, [selected.id]: nextCode },
  }));

  const chooseProblem = (id) => { setSelectedId(id); setTab('problem'); setResults(null); };

  const run = useCallback(async () => {
    setRunning(true); setResults(null); setTab('output');
    const nextResults = await runProblem(selected, code);
    setResults(nextResults); setRunning(false);
    if (nextResults.every((result) => result.passed)) {
      setState((current) => ({
        ...current,
        completedProblemIds: current.completedProblemIds.includes(selected.id)
          ? current.completedProblemIds
          : [...current.completedProblemIds, selected.id],
      }));
      setSuccess(selected.title);
    }
  }, [code, selected]);

  const resetQuestion = () => {
    setState((current) => {
      const codeByProblemId = { ...current.codeByProblemId };
      delete codeByProblemId[selected.id];
      return { codeByProblemId, completedProblemIds: current.completedProblemIds.filter((id) => id !== selected.id) };
    });
    setResults(null); setTab('problem');
  };

  const resetAll = async () => {
    if (!window.confirm('Reset all saved code and completion marks? This cannot be undone.')) return;
    await clearState();
    setState({ codeByProblemId: {}, completedProblemIds: [] });
    setResults(null); setSuccess(null);
  };

  if (!loaded) return <main className="loading">Loading your saved practice state…</main>;
  return <main className={`app-shell ${listVisible ? '' : 'list-hidden'}`}>
    {listVisible && <Sidebar selectedId={selected.id} completed={completed} onSelect={chooseProblem} onResetAll={resetAll} />}
    <section className="workspace">
      <header className="workspace-header">
        <div><p className="eyebrow">{selected.category}</p><h1>{selected.title}</h1><Difficulty value={selected.difficulty} /></div>
        <div className="actions"><IconButton label={listVisible ? 'Hide problems' : 'Show problems'} onClick={() => setListVisible((visible) => !visible)}>{listVisible ? <CloseIcon /> : <MenuIcon />}</IconButton></div>
      </header>
      <section className="workbench">
        <section className="left-pane">
          <nav className="tabs" aria-label="Question content">
            <button className={tab === 'problem' ? 'active' : ''} onClick={() => setTab('problem')}>Problem</button>
            <button className={tab === 'solution' ? 'active' : ''} onClick={() => setTab('solution')}>Solution</button>
            <button className={tab === 'output' ? 'active' : ''} onClick={() => setTab('output')}>Output</button>
          </nav>
          <div className="left-pane-content" ref={contentRef}>
            {tab === 'problem' && <article className="statement"><ProblemDiagram problemId={selected.id} /><Markdown>{selected.statement}</Markdown></article>}
            {tab === 'solution' && <section className="solution-editor"><h2>Go reference solution</h2><div className="editor"><CodeEditor value={selected.referenceCode} readOnly /></div></section>}
            {tab === 'output' && <TestOutput results={results} running={running} />}
          </div>
        </section>
        <section className="right-pane editor-section"><header><div><h2>Go</h2><p className="editor-note">Write the starter function only. Common packages such as <code>sort</code>, <code>strings</code>, <code>strconv</code>, and <code>container/heap</code> are available.</p></div><div className="editor-actions"><IconButton label="Reset this question's code" onClick={resetQuestion}>↻</IconButton><IconButton label={running ? 'Running tests' : 'Run tests'} className="primary" disabled={running} onClick={run}>{running ? '…' : '▶'}</IconButton></div></header><div className="editor"><CodeEditor value={code} onChange={updateCode} onRun={run} /></div></section>
      </section>
    </section>
    {success && <div className="modal-backdrop" role="presentation"><section className="success-modal" role="dialog" aria-modal="true" aria-label="Question completed"><h2>Answered successfully</h2><p>You passed all three tests for {success}.</p><button className="primary" onClick={() => setSuccess(null)}>Continue</button></section></div>}
  </main>;
}
