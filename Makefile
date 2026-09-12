BUN ?= bun
PAGES_BASE ?= /GoBlind75/

.DEFAULT_GOAL := dev

.PHONY: dev build single-file clean release pages github-pages

dev:
	$(BUN) run dev

build:
	$(BUN) run build

single-file:
	$(BUN) run build:single-file

clean:
	rm -rf -- dist src/generated .cache

release: clean
	$(MAKE) single-file

pages:
	GITHUB_PAGES_BASE="$(PAGES_BASE)" SINGLE_FILE_AS_INDEX=1 $(BUN) scripts/build-single-file.mjs

github-pages: pages
