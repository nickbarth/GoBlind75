BUN ?= bun
PAGES_BASE ?= /GoBlind75/

.DEFAULT_GOAL := dev

.PHONY: dev build clean release pages github-pages

dev:
	$(BUN) run dev

build:
	$(BUN) run build

clean:
	rm -rf -- dist src/generated .cache

release: clean
	$(MAKE) build

pages:
	GITHUB_PAGES_BASE="$(PAGES_BASE)" $(BUN) scripts/build-app.mjs

github-pages: pages
