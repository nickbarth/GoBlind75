// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorView } from '@codemirror/view';
import App from './App.jsx';
import snapshot from './data/blind75-problems.json';
import { loadState, clearState } from './lib/storage.js';
import { runProblem } from './lib/goProblemRunner.js';

vi.mock('./lib/storage.js', () => ({ loadState: vi.fn(), saveState: vi.fn().mockResolvedValue(), clearState: vi.fn().mockResolvedValue() }));
vi.mock('./lib/goProblemRunner.js', () => ({ runProblem: vi.fn(), formatGoCode: vi.fn() }));

beforeEach(() => {
  vi.stubGlobal('React', React);
  Element.prototype.scrollTo = vi.fn();
  Range.prototype.getClientRects = () => [];
  Range.prototype.getBoundingClientRect = () => ({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 });
  loadState.mockResolvedValue({ codeByProblemId: {}, completedProblemIds: [] });
  runProblem.mockResolvedValue([{ passed: true, raw: 'nums = [2,7,11,15]\ntarget = 9', expected: [0, 1], actual: [0, 1] }]);
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

async function setup() {
  const user = userEvent.setup();
  const { container } = render(<App />);
  await screen.findByRole('button', { name: 'Run tests' });
  await waitFor(() => expect(container.querySelector('.editor-section .cm-content')).not.toBeNull());
  const editor = container.querySelector('.editor-section .cm-content');
  const view = EditorView.findFromDOM(editor);
  return { user, editor, view };
}

async function pass(user) {
  await user.click(screen.getByRole('button', { name: 'Run tests' }));
  await screen.findByText('Passed');
}

describe('completion modal', () => {
  it.each(['{Enter}', ' '])('takes focus and restores the editor selection after %s', async (key) => {
    const { user, editor, view } = await setup();
    view.dispatch({ selection: { anchor: 5 } });
    const code = view.state.doc.toString();
    await pass(user);
    const complete = screen.getByRole('button', { name: 'Complete', exact: true });
    expect(document.activeElement).toBe(complete);
    await user.tab();
    expect(document.activeElement).toBe(complete);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(complete);
    await user.keyboard(key);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(editor);
    expect(view.state.selection.main.anchor).toBe(5);
    expect(view.state.doc.toString()).toBe(code);
    await pass(user);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('restores editor focus after clicking Complete', async () => {
    const { user, editor } = await setup();
    await pass(user);
    await user.click(screen.getByRole('button', { name: 'Complete', exact: true }));
    expect(document.activeElement).toBe(editor);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it.each(['question', 'all'])('suppresses saved completions until resetting %s', async (reset) => {
    loadState.mockResolvedValue({ codeByProblemId: {}, completedProblemIds: [snapshot.problems[0].id] });
    const { user } = await setup();
    await pass(user);
    expect(screen.queryByRole('dialog')).toBeNull();
    if (reset === 'question') {
      await user.click(screen.getByRole('button', { name: "Reset this question's code" }));
    } else {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      await user.click(screen.getByRole('button', { name: 'Reset all saved code and completion marks' }));
      await waitFor(() => expect(clearState).toHaveBeenCalled());
    }
    await pass(user);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
