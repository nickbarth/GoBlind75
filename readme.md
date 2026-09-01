# Blind 75 Go Practice

https://www.nicbarth.com/GoBlind75/

A browser-only Go practice app for the Blind 75. It provides 75 categorized problems, a Go editor, three test cases per problem, reference solutions, local progress tracking, and small SVG diagrams for visual problems.

## Requirements

- [Bun](https://bun.sh/)
- Go 1.26 (used to build the browser WebAssembly runtime)

## Quick start

Install JavaScript dependencies once:

```sh
bun install
```

Start the development server:

```sh
make
```

Then open the local URL printed by Vite, normally `http://localhost:5173`.

The first development start builds `public/go/runner.wasm` and its matching Go WebAssembly loader. Those generated files are intentionally ignored by Git.

## Make targets

| Command | Purpose |
| --- | --- |
| `make` or `make dev` | Build the Go runtime and start Vite in development mode. |
| `make build` | Produce a production bundle in `dist/`. |
| `make clean` | Remove generated `dist/`, `public/go/`, and `.cache/` files. |
| `make release` | Clean and create a fresh production bundle. It does not publish or deploy anything. |
| `make pages` | Build `dist/` for a GitHub Pages project site. |

## GitHub Pages

Build a repository-hosted GitHub Pages bundle with:

```sh
make pages
```

By default the generated asset base is `/GoBlind75/`, matching this repository's GitHub Pages path. If you need a different Pages path, pass it explicitly:

```sh
make pages PAGES_BASE=/your-repository-name/
```

The generated `dist/` directory is ready to upload through GitHub Pages or a Pages deployment workflow. The target builds locally only; it does not publish anything.

The included GitHub Actions workflow builds and deploys `dist/` after every push to `main`. After the first successful run, the site is available at [nickbarth.github.io/GoBlind75](https://nickbarth.github.io/GoBlind75/).

## Using the app

- Select a problem from the categorized sidebar. Its difficulty and completion state are shown beside the title.
- Use the `Problem`, `Solution`, and `Output` tabs in the center pane.
- Write the requested Go function in the editor. The harness supplies the surrounding program and any supported standard-library imports.
- Run code with the play button or `Ctrl + '` on Windows/Linux and `Cmd + '` on macOS.
- Each run evaluates three test cases, displays expected and actual output, and captures program stdout.
- Passing all three tests marks the problem complete and shows a confirmation dialog.
- Use the reset icon beside the play button to restore one problem's starter code. The reset icon beside the completion count clears all saved code and completion marks after confirmation.

On desktop, the question list, center content pane, and editor each scroll independently.

## Local data and privacy

The app keeps code and completion state in the browser's IndexedDB database (`blind75-go-practice`). No account, server-side storage, or remote code execution is used.

The browser loads the locally built `runner.wasm` file and runs test programs inside a Web Worker.

## Artwork attribution

`src/assets/go-gopher.svg` is the standing superhero Gopher artwork by [Egon Elbre](https://github.com/egonelbre), from the [gophers repository](https://github.com/egonelbre/gophers/tree/master/vector/superhero). `src/assets/hiking-gopher.svg` is also by Egon Elbre, from the [hiking Gopher artwork](https://github.com/egonelbre/gophers/tree/master/vector/adventure). These artworks are released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). The Go Gopher character was originally designed by Renée French.

## Verification

```sh
# Validate all 75 problem definitions and 225 generated test programs.
bun run test

# Run all 225 reference fixtures through the same Yaegi-based interpreter core.
bun run verify:yaegi

# Test the Go runner package.
(cd go-runner && go test ./...)
```

## Project layout

```text
src/
  App.jsx                  Single-page React interface
  ProblemDiagram.jsx       Local SVG illustrations
  data/                    Problem definitions and test cases
  lib/                     Persistence, test harness, and browser runtime worker
go-runner/                 Go/Yaegi interpreter compiled to WebAssembly
scripts/                   Build and fixture-verification scripts
public/go/                 Generated browser Go runtime (not committed)
dist/                      Generated production bundle (not committed)
```

MIT License
