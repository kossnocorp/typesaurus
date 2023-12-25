.DEFAULT_GOAL := build
.PHONY: build

BIN = $(shell yarn bin)

types:
	npx tsc --build

types-watch:
	npx tsc --build --watch

test: test-node test-browser
.PHONY: test

test-setup:
	npx firebase setup:emulators:firestore

test-node:
	npx firebase emulators:exec --only firestore "npx jest --env node"

test-node-watch:
	npx firebase emulators:exec --only firestore "npx jest --env node --watch"

test-browser:
	npx firebase emulators:exec --only firestore "npx karma start --single-run"

test-browser-watch:
	npx firebase emulators:exec --only firestore "npx karma start"

test-system: test-system-node test-system-browser

test-system-node:
	env GOOGLE_APPLICATION_CREDENTIALS=${CURDIR}/secrets/key.json npx jest --env node

test-system-node-watch:
	npx jest --env node --watch

test-system-browser:
	npx karma start --single-run

test-system-browser-watch:
	npx karma start

test-types: install-attw build 
	@cd lib && attw --pack

build:
	@rm -rf lib
	@npx tsc -p tsconfig.lib.json
	@env BABEL_ENV=esm npx babel src --config-file ./babel.config.lib.json --source-root src --out-dir lib --extensions .mjs,.ts --out-file-extension .mjs --quiet
	@env BABEL_ENV=cjs npx babel src --config-file ./babel.config.lib.json --source-root src --out-dir lib --extensions .mjs,.ts --out-file-extension .js --quiet
	@make sync-files
	@make build-mts
	@cp package.json lib
	@cp *.md lib

copy-mjs:
	@find src -name '*.d.ts' | while read file; do \
		new_file=$${file%.d.ts}.d.mts; \
		cp $$file $$new_file; \
	done

sync-files:
	@find src \( -name '*.d.ts' -o -name '*.json' \) -print0 | while IFS= read -r -d '' file; do \
		dest=`echo "$$file" | sed 's|^src/|lib/|'`; \
		mkdir -p `dirname "$$dest"`; \
		rsync -av "$$file" "$$dest"; \
	done

build-mts:
	@find lib -name '*.d.ts' | while read file; do \
		new_file=$${file%.d.ts}.d.mts; \
		cp $$file $$new_file; \
	done

publish: build
	cd lib && npm publish --access public

publish-next: build
	cd lib && npm publish --access public --tag next

install-attw:
	@if ! command -v attw >/dev/null 2>&1; then \
		npm i -g @arethetypeswrong/cli; \
	fi