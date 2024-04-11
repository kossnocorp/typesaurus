.DEFAULT_GOAL := build
.PHONY: build

BIN = $(shell yarn bin)

types:
	npx tsc --build tsconfig.build.json

types-watch:
	npx tsc --build tsconfig.build.json --watch

types-diagnoze: 
	npx tsc --extendedDiagnostics

types-trace: 
	npx tsc --generateTrace tmp/trace
	npx analyze-trace tmp/trace

test: test-node test-browser
.PHONY: test

test-setup:
	npx firebase setup:emulators:firestore

test-node:
	npx firebase emulators:exec --only firestore "npx vitest run"

test-node-watch:
	npx firebase emulators:exec --only firestore "npx vitest"

test-browser:
	npx firebase emulators:exec --only firestore "env BROWSER=true npx vitest run --browser"

test-browser-watch:
	npx firebase emulators:exec --only firestore "env BROWSER=true npx vitest --browser"

test-system: test-system-node test-system-browser

test-system-node:
	env GOOGLE_APPLICATION_CREDENTIALS=${CURDIR}/secrets/key.json npx vitest run

test-system-node-watch:
	env GOOGLE_APPLICATION_CREDENTIALS=${CURDIR}/secrets/key.json npx vitest

test-system-browser:
	env BROWSER=true npx vitest run --browser

test-system-browser-watch:
	env BROWSER=true npx vitest --browser

test-types: install-attw build 
	@cd lib && attw --pack --exclude-entrypoints adapter/admin adapter/admin/batch adapter/admin/core adapter/admin/firebase adapter/admin/groups adapter/admin/transaction adapter/web adapter/web/batch adapter/web/core adapter/web/firebase adapter/web/groups adapter/web/transaction

build:
	@rm -rf lib
	@npx tsc -p tsconfig.lib.json
	@env BABEL_ENV=esm npx babel src --config-file ./babel.config.lib.json --source-root src --out-dir lib --extensions .mjs,.ts --out-file-extension .mjs --quiet
	@env BABEL_ENV=cjs npx babel src --config-file ./babel.config.lib.json --source-root src --out-dir lib --extensions .mjs,.ts --out-file-extension .js --quiet
	@rm -rf lib/types/*js*
	@make sync-files
	@rm -rf lib/tysts
	@make build-mts
	@cp package.json lib
	@cp *.md lib

sync-files:
	@find src \( -name '*.d.ts' -o -name '*.json' \) -print | while IFS= read -r file; do \
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